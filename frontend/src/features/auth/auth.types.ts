import type { User } from '@/types/user.types';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}
