import axios, { type AxiosInstance } from 'axios';
import { mockApi } from '@/mocks/mock-api';
import type { IAuthApi, IVacationApi } from './api.types';

// Explicit opt-in: set VITE_USE_MOCK_API=true to run without the backend.
const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK_API === 'true';

export const isMockMode = USE_MOCK_MODE;

const TOKEN_KEY = 'vacation_mgmt_auth_token';

export const hasAuthToken = (): boolean => !!localStorage.getItem(TOKEN_KEY);

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
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth routes handle their own 401s: a wrong password must show its message, and the router guard handles /auth/me.
const AUTH_ROUTES = ['/auth/login', '/auth/me'];

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We intentionally DO NOT silently fall back to mock on network failures
    // to preserve clean separation between real API responses and local mocks.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!AUTH_ROUTES.includes(error.config?.url ?? '')) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.assign(`/login?redirect=${redirect}`);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Auth API implementation routed to mock adapter when VITE_USE_MOCK_API=true,
 * otherwise to the real backend REST endpoints.
 */
export const authApiClient: IAuthApi = {
  async login(credentials) {
    if (USE_MOCK_MODE) {
      const session = await mockApi.login(credentials);
      localStorage.setItem(TOKEN_KEY, session.token);
      return session;
    }
    const response = await httpClient.post('/auth/login', credentials);
    const session = response.data;
    localStorage.setItem(TOKEN_KEY, session.token);
    return session;
  },

  async getCurrentUser() {
    if (USE_MOCK_MODE) {
      return mockApi.getCurrentUser();
    }
    const response = await httpClient.get('/auth/me');
    return response.data;
  },

  // JWT is stateless, so real-mode logout only drops the token.
  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    if (USE_MOCK_MODE) {
      return mockApi.logout();
    }
  },
};

/**
 * Vacation Requests API implementation routed to mock adapter when VITE_USE_MOCK_API=true,
 * otherwise to the real backend REST endpoints.
 */
export const vacationApiClient: IVacationApi = {
  async getMyRequests() {
    if (USE_MOCK_MODE) {
      return mockApi.getMyRequests();
    }
    const response = await httpClient.get('/vacation-requests/me');
    return response.data;
  },

  async createRequest(dto) {
    if (USE_MOCK_MODE) {
      return mockApi.createRequest(dto);
    }
    const response = await httpClient.post('/vacation-requests', dto);
    return response.data;
  },

  async getAllRequests(params) {
    if (USE_MOCK_MODE) {
      return mockApi.getAllRequests(params);
    }
    // The backend rejects userId=ALL (it must be a UUID) and ignores empty search, so drop both.
    const { requesterId, searchTerm, ...rest } = params;
    const response = await httpClient.get('/vacation-requests', {
      params: {
        ...rest,
        userId: requesterId && requesterId !== 'ALL' ? requesterId : undefined,
        search: searchTerm?.trim() || undefined,
      },
    });
    return response.data;
  },

  async approveRequest(id) {
    if (USE_MOCK_MODE) {
      return mockApi.approveRequest(id);
    }
    const response = await httpClient.patch(`/vacation-requests/${id}/approve`);
    return response.data;
  },

  async rejectRequest(id, comment) {
    if (USE_MOCK_MODE) {
      return mockApi.rejectRequest(id, comment);
    }
    const response = await httpClient.patch(`/vacation-requests/${id}/reject`, { comment });
    return response.data;
  },

  async getRequesters() {
    if (USE_MOCK_MODE) {
      return mockApi.getRequesters();
    }
    const response = await httpClient.get('/users', { params: { role: 'REQUESTER' } });
    return response.data;
  },

  async getTeamPlanning(year, month) {
    if (USE_MOCK_MODE) {
      return mockApi.getTeamPlanning(year, month);
    }
    const response = await httpClient.get('/team-planning', {
      params: { year, month },
    });
    return response.data;
  },
};
