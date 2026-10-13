import { z } from 'zod';
import { VACATION_STATUSES } from '../database/entities/vacation-request.entity';

export const MAX_PAGE_SIZE = 100;

const isRealDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the YYYY-MM-DD format.')
  .refine(isRealDate, 'Not a valid calendar date.');

export const createVacationRequestSchema = z.object({
  startDate: isoDate,
  endDate: isoDate,
  reason: z
    .string()
    .trim()
    .max(500, 'Reason must be at most 500 characters.')
    .nullish()
    .transform((value) => value || null),
});

export const rejectVacationRequestSchema = z.object({
  comment: z.string().trim().min(1, 'A rejection comment is required.').max(1000, 'Comment must be at most 1000 characters.'),
});

export const requestIdSchema = z.object({ id: z.uuid('Invalid request id.') });

export const listVacationRequestsSchema = z.object({
  status: z.enum([...VACATION_STATUSES, 'ALL']).optional(),
  userId: z.uuid('Invalid user id.').optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .default(10)
    .transform((n) => Math.min(n, MAX_PAGE_SIZE)),
});

export type ListVacationRequestsQuery = z.infer<typeof listVacationRequestsSchema>;
