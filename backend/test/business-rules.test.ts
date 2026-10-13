import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET ??= 'test-secret-that-is-at-least-32-characters-long';
process.env.DATABASE_URL ??= 'postgres://unused:unused@localhost:5432/unused';

import { authenticate } from '../src/auth/auth.guard';
import { inclusiveDayCount, daysInMonth, monthBounds } from '../src/shared/dates';
import { AppError } from '../src/shared/errors';
import { parseWith, readQuery, type CommonEvent } from '../src/shared/http';
import {
  CreateVacationRequestCommand,
  handleCreateVacationRequest,
} from '../src/vacation-requests/vacation-request.commands';
import {
  createVacationRequestSchema,
  listVacationRequestsSchema,
  rejectVacationRequestSchema,
} from '../src/vacation-requests/vacation-request.schemas';

const rejectsWith = (status: number, code: string) => (error: unknown) =>
  error instanceof AppError && error.status === status && error.code === code;

const eventWithToken = (token?: string): CommonEvent => ({
  path: '/',
  method: 'GET',
  body: null,
  pathParameters: {},
  queryStringParameters: {},
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  version: 'commonEvent',
});

const sign = (role: string, options: jwt.SignOptions = {}) =>
  jwt.sign({ role }, process.env.JWT_SECRET!, { subject: 'user-1', expiresIn: '1h', ...options });

describe('date rules (checked before any database access)', () => {
  const today = '2030-06-15';
  const create = (start: string, end: string) =>
    handleCreateVacationRequest(new CreateVacationRequestCommand('user-1', start, end, null), today);

  it('rejects a start date in the past', async () => {
    await assert.rejects(create('2030-06-14', '2030-06-20'), rejectsWith(400, 'VALIDATION_ERROR'));
  });

  it('rejects an end date equal to or before the start date', async () => {
    await assert.rejects(create('2030-06-20', '2030-06-20'), rejectsWith(400, 'VALIDATION_ERROR'));
    await assert.rejects(create('2030-06-20', '2030-06-19'), rejectsWith(400, 'VALIDATION_ERROR'));
  });

  it('counts days inclusively and handles month lengths', () => {
    assert.equal(inclusiveDayCount('2026-10-20', '2026-10-24'), 5);
    assert.equal(inclusiveDayCount('2026-03-28', '2026-03-30'), 3); // DST change in Europe
    assert.equal(daysInMonth(2028, 2), 29);
    assert.deepEqual(monthBounds(2026, 11), { start: '2026-11-01', end: '2026-11-30' });
  });
});

describe('request validation', () => {
  it('requires real YYYY-MM-DD dates', () => {
    assert.throws(() => parseWith(createVacationRequestSchema, { startDate: '2030-02-30', endDate: '2030-03-02' }), rejectsWith(400, 'VALIDATION_ERROR'));
    assert.throws(() => parseWith(createVacationRequestSchema, { startDate: '15/06/2030', endDate: '2030-06-20' }), rejectsWith(400, 'VALIDATION_ERROR'));
  });

  it('normalizes an empty reason to null', () => {
    assert.equal(parseWith(createVacationRequestSchema, { startDate: '2030-06-15', endDate: '2030-06-16', reason: '  ' }).reason, null);
  });

  it('requires a non-blank rejection comment', () => {
    assert.throws(() => parseWith(rejectVacationRequestSchema, { comment: '   ' }), rejectsWith(400, 'VALIDATION_ERROR'));
    assert.equal(parseWith(rejectVacationRequestSchema, { comment: '  Busy sprint  ' }).comment, 'Busy sprint');
  });

  it('defaults pagination and caps the page size', () => {
    assert.deepEqual(parseWith(listVacationRequestsSchema, {}), { page: 1, pageSize: 10 });
    assert.equal(parseWith(listVacationRequestsSchema, { pageSize: '5000' }).pageSize, 100);
    assert.throws(() => parseWith(listVacationRequestsSchema, { page: '0' }), rejectsWith(400, 'VALIDATION_ERROR'));
    assert.throws(() => parseWith(listVacationRequestsSchema, { status: 'DONE' }), rejectsWith(400, 'VALIDATION_ERROR'));
  });

  it('URL-decodes query values from the dev server', () => {
    assert.deepEqual(readQuery({ ...eventWithToken(), queryStringParameters: { search: 'Alex%20Morgan', page: '' } }), { search: 'Alex Morgan' });
  });
});

describe('role-based access', () => {
  it('rejects missing, malformed, tampered and expired tokens with 401', () => {
    assert.throws(() => authenticate(eventWithToken()), rejectsWith(401, 'UNAUTHORIZED'));
    assert.throws(() => authenticate(eventWithToken('not-a-jwt')), rejectsWith(401, 'UNAUTHORIZED'));
    assert.throws(() => authenticate(eventWithToken(`${sign('VALIDATOR')}x`)), rejectsWith(401, 'UNAUTHORIZED'));
    assert.throws(() => authenticate(eventWithToken(sign('VALIDATOR', { expiresIn: -10 }))), rejectsWith(401, 'UNAUTHORIZED'));
  });

  it('rejects tokens with an unknown role or a different algorithm', () => {
    assert.throws(() => authenticate(eventWithToken(sign('ADMIN'))), rejectsWith(401, 'UNAUTHORIZED'));
    const unsigned = jwt.sign({ role: 'VALIDATOR', sub: 'user-1' }, '', { algorithm: 'none' });
    assert.throws(() => authenticate(eventWithToken(unsigned)), rejectsWith(401, 'UNAUTHORIZED'));
  });

  it('only lets validators through validator-only guards', () => {
    assert.throws(() => authenticate(eventWithToken(sign('REQUESTER')), ['VALIDATOR']), rejectsWith(403, 'FORBIDDEN'));
    assert.deepEqual(authenticate(eventWithToken(sign('VALIDATOR')), ['VALIDATOR']), { userId: 'user-1', role: 'VALIDATOR' });
  });
});
