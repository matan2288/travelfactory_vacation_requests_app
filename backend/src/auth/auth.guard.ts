import type { UserRole } from '../database/entities/user.entity';
import { ForbiddenError, UnauthorizedError } from '../shared/errors';
import { header, type CommonEvent } from '../shared/http';
import { verifyToken, type AuthContext } from './auth.service';

export type Authenticated<T = object> = T & { auth: AuthContext };

/** Verifies the bearer token and, when `roles` is given, that the caller has one of them. */
export function authenticate(event: CommonEvent, roles?: readonly UserRole[]): AuthContext {
  const match = /^Bearer\s+(\S+)$/i.exec(header(event, 'authorization') ?? '');
  if (!match) throw new UnauthorizedError();
  const auth = verifyToken(match[1]);
  if (roles && !roles.includes(auth.role)) throw new ForbiddenError();
  return auth;
}

/**
 * Builds a CEF input parser that authenticates first, then validates the request,
 * so unauthenticated callers get 401/403 before any 400.
 */
export function guarded<T extends object = object>(
  roles: readonly UserRole[] | null,
  read: (event: CommonEvent) => T = () => ({}) as T,
): (event: CommonEvent) => Authenticated<T> {
  return (event) => {
    const auth = authenticate(event, roles ?? undefined);
    return { ...read(event), auth };
  };
}
