import Vue from 'vue';
import type { User } from '@/types/user.types';
import type { LoginCredentials } from './auth.types';
import { authApiClient } from '@/services/api-client';
import { mockApi } from '@/mocks/mock-api';
import { SEEDED_USERS } from '@/mocks/mock-data';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const state: AuthState = Vue.observable({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
});

export const authService = {
  get state(): Readonly<AuthState> {
    return state;
  },

  get currentUser(): User | null {
    return state.currentUser;
  },

  get isAuthenticated(): boolean {
    return state.isAuthenticated;
  },

  get isValidator(): boolean {
    return state.currentUser?.role === 'VALIDATOR';
  },

  get isRequester(): boolean {
    return state.currentUser?.role === 'REQUESTER';
  },

  get seededDemoUsers(): User[] {
    return SEEDED_USERS;
  },

  async init(): Promise<User | null> {
    state.isLoading = true;
    state.error = null;
    try {
      const user = await authApiClient.getCurrentUser();
      state.currentUser = user;
      state.isAuthenticated = !!user;
      return user;
    } catch {
      state.currentUser = null;
      state.isAuthenticated = false;
      return null;
    } finally {
      state.isLoading = false;
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    state.isLoading = true;
    state.error = null;
    try {
      const session = await authApiClient.login(credentials);
      state.currentUser = session.user;
      state.isAuthenticated = true;
      return session.user;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Authentication failed';
      throw err;
    } finally {
      state.isLoading = false;
    }
  },

  async logout(): Promise<void> {
    state.isLoading = true;
    try {
      await authApiClient.logout();
    } finally {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    }
  },

  switchDemoUser(userId: string): User {
    const user = mockApi.switchDemoUser(userId);
    state.currentUser = user;
    state.isAuthenticated = true;
    return user;
  },
};
