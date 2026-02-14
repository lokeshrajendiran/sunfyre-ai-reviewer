import axios, { AxiosInstance } from 'axios';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  base: {
    ref: string;
  };
  head: {
    ref: string;
  };
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
}

export interface GitHubPRFiles {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export class GitHubClient {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  async getUserRepos(): Promise<GitHubRepo[]> {
    try {
      const response = await this.client.get('/user/repos', {
        params: {
          sort: 'updated',
          per_page: 100,
          affiliation: 'owner,collaborator,organization_member',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw new Error('Failed to fetch repositories from GitHub');
    }
  }

  async getRepoPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPullRequest[]> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/pulls`, {
        params: {
          state,
          per_page: 100,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching PRs for ${owner}/${repo}:`, error);
      throw new Error('Failed to fetch pull requests from GitHub');
    }
  }

  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<GitHubPullRequest> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching PR #${prNumber}:`, error);
      throw new Error('Failed to fetch pull request details');
    }
  }

  async getPullRequestFiles(owner: string, repo: string, prNumber: number): Promise<GitHubPRFiles[]> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}/files`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching files for PR #${prNumber}:`, error);
      throw new Error('Failed to fetch pull request files');
    }
  }

  async getPullRequestDiff(owner: string, repo: string, prNumber: number): Promise<string> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: {
          Accept: 'application/vnd.github.v3.diff',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching diff for PR #${prNumber}:`, error);
      throw new Error('Failed to fetch pull request diff');
    }
  }

  async getCommits(owner: string, repo: string, prNumber: number): Promise<any[]> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}/commits`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching commits for PR #${prNumber}:`, error);
      throw new Error('Failed to fetch pull request commits');
    }
  }
}
