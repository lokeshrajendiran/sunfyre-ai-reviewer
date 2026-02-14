import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { config } from '../config';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  }

  // Repositories
  async syncRepositories() {
    const response = await this.client.post('/repositories/sync');
    return response.data;
  }

  async getRepositories() {
    const response = await this.client.get('/repositories');
    return response.data;
  }

  async getRepository(id: string) {
    const response = await this.client.get(`/repositories/${id}`);
    return response.data;
  }

  async toggleRepository(id: string) {
    const response = await this.client.patch(`/repositories/${id}/toggle`);
    return response.data;
  }

  // Pull Requests
  async syncPullRequests(repositoryId: string) {
    const response = await this.client.post(
      `/pull-requests/repository/${repositoryId}/sync`
    );
    return response.data;
  }

  async getPullRequests(repositoryId: string, state?: string) {
    const response = await this.client.get(
      `/pull-requests/repository/${repositoryId}`,
      { params: { state } }
    );
    return response.data;
  }

  async getPullRequest(id: string) {
    const response = await this.client.get(`/pull-requests/${id}`);
    return response.data;
  }

  async analyzePullRequest(id: string) {
    const response = await this.client.post(`/pull-requests/${id}/analyze`);
    return response.data;
  }

  async getAIReviews(id: string) {
    const response = await this.client.get(`/pull-requests/${id}/reviews`);
    return response.data;
  }
}

export const apiClient = new APIClient();
