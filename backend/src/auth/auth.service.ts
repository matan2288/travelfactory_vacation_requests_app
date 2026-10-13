import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getDataSource } from '../database/data-source';
import { User, USER_ROLES, type UserRole } from '../database/entities/user.entity';
import { UnauthorizedError } from '../shared/errors';
import { toUserDto, type UserDto } from '../users/user.mapper';

export interface AuthContext {
  userId: string;
  role: UserRole;
}

export interface AuthSession {
  user: UserDto;
  token: string;
  expiresAt: string;
}

const INVALID_CREDENTIALS = 'Invalid email or password.';

let dummyHash: string | undefined;

/** Verifies credentials and issues a bearer JWT carrying only the user id and role. */
export async function login(email: string, password: string): Promise<AuthSession> {
  const user = await getDataSource()
    .getRepository(User)
    .createQueryBuilder('u')
    .addSelect('u.password')
    .where('u.email = :email', { email: email.toLowerCase() })
    .getOne();

  // Compare against a dummy hash for unknown emails so response time doesn't reveal which emails exist.
  dummyHash ??= bcrypt.hashSync('timing-equalizer', 10);
  const valid = await bcrypt.compare(password, user?.password ?? dummyHash);
  if (!user || !valid) throw new UnauthorizedError(INVALID_CREDENTIALS);

  const token = jwt.sign({ role: user.role }, env().JWT_SECRET, {
    subject: user.id,
    expiresIn: env().JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
  const { exp } = jwt.decode(token) as { exp: number };
  return { user: toUserDto(user), token, expiresAt: new Date(exp * 1000).toISOString() };
}

export function verifyToken(token: string): AuthContext {
  try {
    const payload = jwt.verify(token, env().JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || !payload.sub || !USER_ROLES.includes(payload.role)) {
      throw new UnauthorizedError('Invalid token.');
    }
    return { userId: payload.sub, role: payload.role };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) throw new UnauthorizedError('Session expired. Please sign in again.');
    throw new UnauthorizedError('Invalid token.');
  }
}

export async function getCurrentUser(auth: AuthContext): Promise<UserDto> {
  const user = await getDataSource().getRepository(User).findOneBy({ id: auth.userId });
  if (!user) throw new UnauthorizedError('Account no longer exists.');
  return toUserDto(user);
}
