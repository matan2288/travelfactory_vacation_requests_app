import axios, { type AxiosInstance } from 'axios';
import { mockApi } from '@/mocks/mock-api';
import type { IAuthApi, IVacationApi } from './api.types';

// Explicit mock mode configuration: Defaults to true because the backend is an intentional placeholder
const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const isMockMode = USE_MOCK_MODE;

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authorization tokens
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vacation_mgmt_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We intentionally DO NOT silently fall back to mock on network failures
    // to preserve clean separation between real API responses and local mocks.
    return Promise.reject(error);
  }
);

/**
 * Auth API implementation routed to mock adapter in local development mode
 * or real backend REST endpoints when VITE_USE_MOCK_API=false.
 */
export const authApiClient: IAuthApi = {
  async login(credentials) {
    if (USE_MOCK_MODE) {
      const session = await mockApi.login(credentials);
      localStorage.setItem('vacation_mgmt_auth_token', session.token);
      return session;
    }
    const response = await httpClient.post('/auth/login', credentials);
    const session = response.data;
    localStorage.setItem('vacation_mgmt_auth_token', session.token);
    return session;
  },

  async getCurrentUser() {
    if (USE_MOCK_MODE) {
      return mockApi.getCurrentUser();
    }
    const response = await httpClient.get('/auth/me');
    return response.data;
  },

  async logout() {
    localStorage.removeItem('vacation_mgmt_auth_token');
    if (USE_MOCK_MODE) {
      return mockApi.logout();
    }
    await httpClient.post('/auth/logout');
  },
};

/**
 * Vacation Requests API implementation routed to mock adapter in local development mode
 * or real backend REST endpoints when VITE_USE_MOCK_API=false.
 */
export const vacationApiClient: IVacationApi = {
  async getMyRequests() {
    if (USE_MOCK_MODE) {
      return mockApi.getMyRequests();
    }
    const response = await httpClient.get('/vacations/my');
    return response.data;
  },

  async createRequest(dto) {
    if (USE_MOCK_MODE) {
      return mockApi.createRequest(dto);
    }
    const response = await httpClient.post('/vacations', dto);
    return response.data;
  },

  async getAllRequests(params) {
    if (USE_MOCK_MODE) {
      return mockApi.getAllRequests(params);
    }
    const response = await httpClient.get('/vacations', { params });
    return response.data;
  },

  async approveRequest(id) {
    if (USE_MOCK_MODE) {
      return mockApi.approveRequest(id);
    }
    const response = await httpClient.put(`/vacations/${id}/approve`);
    return response.data;
  },

  async rejectRequest(id, comment) {
    if (USE_MOCK_MODE) {
      return mockApi.rejectRequest(id, comment);
    }
    const response = await httpClient.put(`/vacations/${id}/reject`, { comment });
    return response.data;
  },

  async getTeamPlanning(year, month) {
    if (USE_MOCK_MODE) {
      return mockApi.getTeamPlanning(year, month);
    }
    const response = await httpClient.get('/team/planning', {
      params: { year, month },
    });
    return response.data;
  },
};
