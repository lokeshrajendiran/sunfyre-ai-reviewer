import { Response } from 'express';
import { AuthRequest } from '../middleware';
import { Repository } from '../models';
import { GitHubClient } from '../services/githubClient';

export const repositoryController = {
  // Sync repositories from GitHub
  syncRepositories: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const githubClient = new GitHubClient(req.user.accessToken);
      const githubRepos = await githubClient.getUserRepos();

      const savedRepos = [];

      for (const repo of githubRepos) {
        const existingRepo = await Repository.findOne({
          userId: req.user._id,
          githubId: repo.id,
        });

        if (existingRepo) {
          // Update existing repository
          existingRepo.name = repo.name;
          existingRepo.fullName = repo.full_name;
          existingRepo.description = repo.description || undefined;
          existingRepo.isPrivate = repo.private;
          existingRepo.url = repo.html_url;
          existingRepo.defaultBranch = repo.default_branch;
          existingRepo.language = repo.language || undefined;
          existingRepo.stars = repo.stargazers_count;
          existingRepo.forks = repo.forks_count;
          existingRepo.lastSyncedAt = new Date();
          
          await existingRepo.save();
          savedRepos.push(existingRepo);
        } else {
          // Create new repository
          const newRepo = new Repository({
            userId: req.user._id,
            githubId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            owner: repo.owner.login,
            description: repo.description,
            isPrivate: repo.private,
            url: repo.html_url,
            defaultBranch: repo.default_branch,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            lastSyncedAt: new Date(),
          });
          await newRepo.save();
          savedRepos.push(newRepo);
        }
      }

      res.json({
        success: true,
        data: {
          repositories: savedRepos,
          count: savedRepos.length,
        },
      });
    } catch (error) {
      console.error('Sync repositories error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to sync repositories' },
      });
    }
  },

  // Get user's repositories
  getRepositories: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const repositories = await Repository.find({
        userId: req.user._id,
        isActive: true,
      }).sort({ lastSyncedAt: -1 });

      res.json({
        success: true,
        data: {
          repositories,
          count: repositories.length,
        },
      });
    } catch (error) {
      console.error('Get repositories error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch repositories' },
      });
    }
  },

  // Get single repository
  getRepository: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { id } = req.params;

      const repository = await Repository.findOne({
        _id: id,
        userId: req.user._id,
      });

      if (!repository) {
        return res.status(404).json({
          success: false,
          error: { message: 'Repository not found' },
        });
      }

      res.json({
        success: true,
        data: { repository },
      });
    } catch (error) {
      console.error('Get repository error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch repository' },
      });
    }
  },

  // Toggle repository active status
  toggleRepository: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { id } = req.params;

      const repository = await Repository.findOne({
        _id: id,
        userId: req.user._id,
      });

      if (!repository) {
        return res.status(404).json({
          success: false,
          error: { message: 'Repository not found' },
        });
      }

      repository.isActive = !repository.isActive;
      await repository.save();

      res.json({
        success: true,
        data: { repository },
      });
    } catch (error) {
      console.error('Toggle repository error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to toggle repository' },
      });
    }
  },
};
