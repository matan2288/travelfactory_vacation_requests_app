/**
 * Database-backed API tests through the real CEF entry point.
 * Requires the Docker PostgreSQL (`npm run db:up && npm run db:migrate`); uses its own throwaway users.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import bcrypt from 'bcryptjs';
import type { Context } from 'commoneventframework';
import { handler } from '../src/index';
import { getDataSource, initDataSource } from '../src/database/data-source';
import { User, type UserRole } from '../src/database/entities/user.entity';
import { eventDispatcher, type DomainEvent } from '../src/shared/events';

const PASSWORD = 'test-password';
const run = randomUUID().slice(0, 8);
const context = { invokedFunctionArn: 'local' } as Context;
const published: DomainEvent[] = [];
const tokens: Record<'requester' | 'other' | 'validator', string> = { requester: '', other: '', validator: '' };
const ids: Record<'requester' | 'other' | 'validator', string> = { requester: '', other: '', validator: '' };

type Call = { method: string; path: string; token?: string; body?: unknown; query?: Record<string, string> };

async function call({ method, path, token, body, query }: Call) {
  const res = await handler(
    {
      method,
      path,
      body: body === undefined ? null : JSON.stringify(body),
      pathParameters: {},
      queryStringParameters: query ?? {},
      headers: token ? { authorization: `Bearer ${token}` } : {},
      version: 'commonEvent',
    },
    context,
  );
  return { status: res.statusCode, body: JSON.parse(res.body as string) };
}

async function createUser(key: keyof typeof ids, role: UserRole) {
  const email = `${key}.${run}@test.internal`;
  const user = await getDataSource().getRepository(User).save({
    name: `Test ${key} ${run}`,
    email,
    role,
    password: await bcrypt.hash(PASSWORD, 4),
  });
  ids[key] = user.id;
  const login = await call({ method: 'POST', path: '/auth/login', body: { email, password: PASSWORD } });
  assert.equal(login.status, 200);
  tokens[key] = login.body.token;
}

const submit = (startDate: string, endDate: string, token = tokens.requester) =>
  call({ method: 'POST', path: '/vacation-requests', token, body: { startDate, endDate, reason: 'Private reason' } });

before(async () => {
  await initDataSource();
  eventDispatcher.subscribe('*', (event) => void published.push(event));
  await createUser('requester', 'REQUESTER');
  await createUser('other', 'REQUESTER');
  await createUser('validator', 'VALIDATOR');
});

after(async () => {
  await getDataSource().getRepository(User).delete(Object.values(ids)); // requests cascade
  await getDataSource().destroy();
});

describe('authentication', () => {
  it('returns the same generic 401 for a wrong password and an unknown email', async () => {
    const wrong = await call({ method: 'POST', path: '/auth/login', body: { email: `requester.${run}@test.internal`, password: 'nope' } });
    const unknown = await call({ method: 'POST', path: '/auth/login', body: { email: `ghost.${run}@test.internal`, password: 'nope' } });
    assert.equal(wrong.status, 401);
    assert.deepEqual(wrong.body, unknown.body);
    assert.deepEqual(Object.keys(wrong.body).sort(), ['code', 'message']);
  });

  it('returns the current user without the password hash', async () => {
    const me = await call({ method: 'GET', path: '/auth/me', token: tokens.requester });
    assert.equal(me.status, 200);
    assert.deepEqual(Object.keys(me.body).sort(), ['email', 'id', 'name', 'role']);
  });

  it('requires a token on protected routes and enforces roles', async () => {
    assert.equal((await call({ method: 'GET', path: '/vacation-requests/me' })).status, 401);
    assert.equal((await call({ method: 'GET', path: '/vacation-requests', token: tokens.requester })).status, 403);
    assert.equal((await call({ method: 'GET', path: '/users', token: tokens.requester })).status, 403);
    assert.equal((await submit('2031-01-01', '2031-01-02', tokens.validator)).status, 403);
  });

  it('checks auth before validation so anonymous callers never see a 400', async () => {
    assert.equal((await call({ method: 'POST', path: '/vacation-requests', body: { startDate: 'bad' } })).status, 401);
  });
});

describe('vacation request lifecycle', () => {
  let approvedId = '';
  let rejectedId = '';

  it('creates a PENDING request with the agreed DTO shape and emits an event', async () => {
    const res = await submit('2031-03-10', '2031-03-14');
    assert.equal(res.status, 201);
    assert.deepEqual(Object.keys(res.body).sort(), [
      'comments', 'createdAt', 'daysCount', 'endDate', 'id', 'reason', 'requesterEmail', 'requesterId',
      'requesterName', 'startDate', 'status', 'updatedAt',
    ]);
    assert.equal(res.body.status, 'PENDING');
    assert.equal(res.body.daysCount, 5);
    assert.equal(res.body.startDate, '2031-03-10');
    assert.ok(published.some((e) => e.name === 'VacationRequestCreated'));
    approvedId = res.body.id;
  });

  it('rejects overlapping requests for the same user, including touching end dates', async () => {
    const overlap = await submit('2031-03-14', '2031-03-20');
    assert.equal(overlap.status, 409);
    assert.equal(overlap.body.code, 'OVERLAPPING_REQUEST');
    assert.equal((await submit('2031-03-15', '2031-03-16')).status, 201);
  });

  it('allows the same dates for a different user', async () => {
    assert.equal((await submit('2031-03-10', '2031-03-14', tokens.other)).status, 201);
  });

  it('rejects past start dates', async () => {
    const res = await submit('2020-01-01', '2020-01-05');
    assert.equal(res.status, 400);
    assert.ok(res.body.details.startDate);
  });

  it('approves a pending request once, then locks it', async () => {
    const approved = await call({ method: 'PATCH', path: `/vacation-requests/${approvedId}/approve`, token: tokens.validator, body: { comment: '  Enjoy  ' } });
    assert.equal(approved.status, 200);
    assert.equal(approved.body.status, 'APPROVED');
    assert.equal(approved.body.comments, 'Enjoy');
    assert.notEqual(approved.body.updatedAt, approved.body.createdAt);
    const event = published.find((e) => e.name === 'VacationRequestApproved') as DomainEvent & { validatorId: string };
    assert.equal(event.validatorId, ids.validator);

    const again = await call({ method: 'PATCH', path: `/vacation-requests/${approvedId}/approve`, token: tokens.validator });
    const reject = await call({ method: 'PATCH', path: `/vacation-requests/${approvedId}/reject`, token: tokens.validator, body: { comment: 'Too late' } });
    assert.equal(again.status, 409);
    assert.equal(reject.status, 409);
    assert.equal(reject.body.code, 'REQUEST_NOT_PENDING');
  });

  it('requires a comment to reject and stores it', async () => {
    const created = await submit('2031-05-04', '2031-05-08');
    rejectedId = created.body.id;
    const path = `/vacation-requests/${rejectedId}/reject`;

    const missing = await call({ method: 'PATCH', path, token: tokens.validator, body: { comment: '  ' } });
    assert.equal(missing.status, 400);
    assert.ok(missing.body.details.comment);

    const rejected = await call({ method: 'PATCH', path, token: tokens.validator, body: { comment: ' Release week ' } });
    assert.equal(rejected.status, 200);
    assert.equal(rejected.body.status, 'REJECTED');
    assert.equal(rejected.body.comments, 'Release week');
  });

  it('frees the dates of a rejected request', async () => {
    assert.equal((await submit('2031-05-04', '2031-05-08')).status, 201);
  });

  it('returns 404 for unknown ids and 400 for malformed ids', async () => {
    assert.equal((await call({ method: 'PATCH', path: `/vacation-requests/${randomUUID()}/approve`, token: tokens.validator })).status, 404);
    assert.equal((await call({ method: 'PATCH', path: '/vacation-requests/not-a-uuid/approve', token: tokens.validator })).status, 400);
  });
});

describe('listing', () => {
  it("lists only the requester's own requests", async () => {
    const res = await call({ method: 'GET', path: '/vacation-requests/me', token: tokens.requester });
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 4);
    assert.ok(res.body.every((r: { requesterId: string }) => r.requesterId === ids.requester));
  });

  it('filters by user and status and paginates for validators', async () => {
    const query = { userId: ids.requester, pageSize: '3' };
    const page1 = await call({ method: 'GET', path: '/vacation-requests', token: tokens.validator, query });
    assert.equal(page1.status, 200);
    assert.deepEqual({ total: page1.body.total, totalPages: page1.body.totalPages, count: page1.body.items.length }, { total: 4, totalPages: 2, count: 3 });
    assert.equal(page1.body.items[0].status, 'PENDING'); // pending first

    const page2 = await call({ method: 'GET', path: '/vacation-requests', token: tokens.validator, query: { ...query, page: '2' } });
    assert.equal(page2.body.items.length, 1);
    const allIds = [...page1.body.items, ...page2.body.items].map((r: { id: string }) => r.id);
    assert.equal(new Set(allIds).size, 4);

    const approved = await call({ method: 'GET', path: '/vacation-requests', token: tokens.validator, query: { userId: ids.requester, status: 'APPROVED' } });
    assert.deepEqual(approved.body.items.map((r: { status: string }) => r.status), ['APPROVED']);
  });

  it('searches requester names case-insensitively', async () => {
    const res = await call({ method: 'GET', path: '/vacation-requests', token: tokens.validator, query: { search: `TEST%20OTHER%20${run}` } });
    assert.equal(res.body.total, 1);
    assert.equal(res.body.items[0].requesterId, ids.other);
  });

  it('lists requesters for the filter', async () => {
    const res = await call({ method: 'GET', path: '/users', token: tokens.validator, query: { role: 'REQUESTER' } });
    assert.ok(res.body.some((u: { id: string }) => u.id === ids.requester));
    assert.ok(res.body.every((u: { role: string }) => u.role === 'REQUESTER'));
  });

  it('team planning shows pending and approved requests without private fields', async () => {
    const res = await call({ method: 'GET', path: '/team-planning', token: tokens.requester, query: { year: '2031', month: '5' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.daysInMonth, 31);
    const mine = res.body.members.find((m: { user: { id: string } }) => m.user.id === ids.requester);
    assert.equal(mine.requests.length, 1); // the rejected May request is excluded
    assert.equal(mine.requests[0].status, 'PENDING');
    assert.equal('reason' in mine.requests[0], false);
    assert.equal('comments' in mine.requests[0], false);
  });
});

describe('errors', () => {
  it('returns the standard error shape for unknown routes and invalid JSON', async () => {
    const missing = await call({ method: 'GET', path: '/nope', token: tokens.requester });
    assert.equal(missing.status, 404);
    assert.equal(missing.body.code, 'NOT_FOUND');

    const res = await handler(
      { method: 'POST', path: '/auth/login', body: '{bad', pathParameters: {}, queryStringParameters: {}, headers: {}, version: 'commonEvent' },
      context,
    );
    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body as string).code, 'VALIDATION_ERROR');
  });
});
