import { z } from 'zod';
import { parseWith, readJsonBody, type HandlerFn, type InputParserFn } from '../shared/http';
import { guarded, type Authenticated } from './auth.guard';
import { getCurrentUser, login as loginUser, type AuthSession } from './auth.service';
import type { UserDto } from '../users/user.mapper';

const loginSchema = z.object({
  email: z.string().trim().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.').max(200),
});

type LoginInput = z.infer<typeof loginSchema>;

export const parseLogin: InputParserFn<LoginInput> = (event) => parseWith(loginSchema, readJsonBody(event));

export const login: HandlerFn<LoginInput, AuthSession> = ({ email, password }) => loginUser(email, password);

export const parseMe = guarded(null);

export const me: HandlerFn<Authenticated, UserDto> = ({ auth }) => getCurrentUser(auth);
