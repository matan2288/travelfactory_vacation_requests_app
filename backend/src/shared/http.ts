import type { CommonEvent } from 'commoneventframework/dist/types/commonEvent';
import type { z } from 'zod';
import { ValidationError } from './errors';

export type { CommonEvent };

/** CEF `x-inputParser`: runs before the handler; may throw an `AppError`. */
export type InputParserFn<T> = (event: CommonEvent) => T;

/** CEF `x-handler`: receives the parser's output; a plain object becomes a 200 JSON response. */
export type HandlerFn<I, O = unknown> = (input: I, event: CommonEvent) => Promise<O>;

/** Marks a handler result that needs a non-200 status (e.g. 201 Created). */
export class HttpResult<T> {
  constructor(
    readonly statusCode: number,
    readonly body: T,
  ) {}
}

export function header(event: CommonEvent, name: string): string | undefined {
  const target = name.toLowerCase();
  const entry = Object.entries(event.headers ?? {}).find(([key]) => key.toLowerCase() === target);
  return entry?.[1];
}

export function readJsonBody(event: CommonEvent): unknown {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    throw new ValidationError('Request body must be valid JSON.');
  }
}

/** The CEF dev server passes raw query strings through, so values are URL-decoded here. */
export function readQuery(event: CommonEvent): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(event.queryStringParameters ?? {})) {
    if (value === undefined || value === '') continue;
    query[key] = safeDecode(value);
  }
  return query;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

export function parseWith<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const details: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_';
    (details[key] ??= []).push(issue.message);
  }
  throw new ValidationError(result.error.issues[0]?.message ?? 'Invalid request.', details);
}
