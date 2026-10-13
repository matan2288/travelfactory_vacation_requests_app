export type ErrorDetails = Record<string, string[]>;

/** Base class for expected failures; mapped to `{ code, message, details? }` with its HTTP status. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: ErrorDetails,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string) {
    super(409, code, message);
  }
}

const PG_EXCLUSION_VIOLATION = '23P01';
const PG_UNIQUE_VIOLATION = '23505';

/** Translates known PostgreSQL constraint violations into domain errors; returns other errors unchanged. */
export function fromDatabaseError(error: unknown): unknown {
  const code = (error as { code?: string } | null)?.code;
  if (code === PG_EXCLUSION_VIOLATION) {
    return new ConflictError('OVERLAPPING_REQUEST', 'This vacation overlaps one of your pending or approved requests.');
  }
  if (code === PG_UNIQUE_VIOLATION) {
    return new ConflictError('DUPLICATE', 'A record with the same unique value already exists.');
  }
  return error;
}
