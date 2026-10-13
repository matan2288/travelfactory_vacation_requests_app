import Vue from 'vue';
import type { User } from '@/types/user.types';
import type { LoginCredentials } from './auth.types';
import { authApiClient, hasAuthToken } from '@/services/api-client';
import { getErrorMessage } from '@/utils/error.utils';

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

  async init(): Promise<User | null> {
    state.error = null;
    // No token means not signed in; skip /auth/me (and the mock's auto-login of the first user).
    if (!hasAuthToken()) {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      return null;
    }
    state.isLoading = true;
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
      state.error = getErrorMessage(err);
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
};
