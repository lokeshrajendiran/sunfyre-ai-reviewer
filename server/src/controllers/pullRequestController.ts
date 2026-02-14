import { Response } from 'express';
import { AuthRequest } from '../middleware';
import { Repository, PullRequest, AIReview } from '../models';
import { GitHubClient } from '../services/githubClient';
import { AIEngine } from '../services/aiEngine';

export const pullRequestController = {
  // Sync pull requests for a repository
  syncPullRequests: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { repositoryId } = req.params;

      const repository = await Repository.findOne({
        _id: repositoryId,
        userId: req.user._id,
      });

      if (!repository) {
        return res.status(404).json({
          success: false,
          error: { message: 'Repository not found' },
        });
      }

      const githubClient = new GitHubClient(req.user.accessToken);
      const [owner, repo] = repository.fullName.split('/');
      
      const githubPRs = await githubClient.getRepoPullRequests(owner, repo, 'all');

      const savedPRs = [];

      for (const pr of githubPRs) {
        const existingPR = await PullRequest.findOne({
          repositoryId: repository._id,
          number: pr.number,
        });

        const prData = {
          userId: req.user._id,
          repositoryId: repository._id,
          githubId: pr.id,
          number: pr.number,
          title: pr.title,
          description: pr.body || undefined,
          state: pr.merged_at ? 'merged' : pr.state as 'open' | 'closed' | 'merged',
          author: {
            username: pr.user.login,
            avatarUrl: pr.user.avatar_url,
          },
          baseBranch: pr.base.ref,
          headBranch: pr.head.ref,
          url: pr.html_url,
          closedAt: pr.closed_at ? new Date(pr.closed_at) : undefined,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
        };

        if (existingPR) {
          Object.assign(existingPR, prData);
          await existingPR.save();
          savedPRs.push(existingPR);
        } else {
          const newPR = await PullRequest.create(prData);
          savedPRs.push(newPR);
        }
      }

      res.json({
        success: true,
        data: {
          pullRequests: savedPRs,
          count: savedPRs.length,
        },
      });
    } catch (error) {
      console.error('Sync pull requests error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to sync pull requests' },
      });
    }
  },

  // Get pull requests for a repository
  getPullRequests: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { repositoryId } = req.params;
      const { state } = req.query;

      const filter: any = {
        repositoryId,
        userId: req.user._id,
      };

      if (state && ['open', 'closed', 'merged'].includes(state as string)) {
        filter.state = state;
      }

      const pullRequests = await PullRequest.find(filter)
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({
        success: true,
        data: {
          pullRequests,
          count: pullRequests.length,
        },
      });
    } catch (error) {
      console.error('Get pull requests error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch pull requests' },
      });
    }
  },

  // Get single pull request
  getPullRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { id } = req.params;

      const pullRequest = await PullRequest.findOne({
        _id: id,
        userId: req.user._id,
      }).populate('repositoryId');

      if (!pullRequest) {
        return res.status(404).json({
          success: false,
          error: { message: 'Pull request not found' },
        });
      }

      // Get latest AI review
      const latestReview = await AIReview.findOne({
        pullRequestId: pullRequest._id,
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: {
          pullRequest,
          aiReview: latestReview,
        },
      });
    } catch (error) {
      console.error('Get pull request error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch pull request' },
      });
    }
  },

  // Analyze pull request with AI
  analyzePullRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { id } = req.params;

      const pullRequest = await PullRequest.findOne({
        _id: id,
        userId: req.user._id,
      }).populate('repositoryId');

      if (!pullRequest) {
        return res.status(404).json({
          success: false,
          error: { message: 'Pull request not found' },
        });
      }

      const repository = pullRequest.repositoryId as any;
      const [owner, repo] = repository.fullName.split('/');

      // Fetch PR diff and files from GitHub
      const githubClient = new GitHubClient(req.user.accessToken);
      const [diff, files, commits] = await Promise.all([
        githubClient.getPullRequestDiff(owner, repo, pullRequest.number),
        githubClient.getPullRequestFiles(owner, repo, pullRequest.number),
        githubClient.getCommits(owner, repo, pullRequest.number),
      ]);

      // Update PR stats
      pullRequest.filesChanged = files.length;
      pullRequest.additions = files.reduce((sum, file) => sum + file.additions, 0);
      pullRequest.deletions = files.reduce((sum, file) => sum + file.deletions, 0);
      pullRequest.commits = commits.length;
      await pullRequest.save();

      // Analyze with AI
      const aiEngine = new AIEngine();
      const analysis = await aiEngine.analyzePullRequest(diff, {
        title: pullRequest.title,
        description: pullRequest.description,
        filesChanged: pullRequest.filesChanged,
        additions: pullRequest.additions,
        deletions: pullRequest.deletions,
      });

      // Save AI review
      const aiReview = await AIReview.create({
        pullRequestId: pullRequest._id,
        userId: req.user._id,
        summary: analysis.summary,
        riskScore: analysis.riskScore,
        riskExplanation: analysis.riskExplanation,
        inlineComments: analysis.inlineComments,
        suggestedTests: analysis.suggestedTests,
        filesAnalyzed: analysis.filesAnalyzed,
        aiModel: 'gpt-4-turbo-preview',
        analysisVersion: '1.0',
      });

      res.json({
        success: true,
        data: {
          aiReview,
        },
      });
    } catch (error) {
      console.error('Analyze pull request error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to analyze pull request' },
      });
    }
  },

  // Get AI reviews for a pull request
  getAIReviews: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { id } = req.params;

      const reviews = await AIReview.find({
        pullRequestId: id,
        userId: req.user._id,
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: {
          reviews,
          count: reviews.length,
        },
      });
    } catch (error) {
      console.error('Get AI reviews error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch AI reviews' },
      });
    }
  },
};
