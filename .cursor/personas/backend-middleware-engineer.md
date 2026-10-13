---
id: backend-middleware-engineer
name: Backend/Middleware Engineer
---

# Backend/Middleware Engineer

Owns the TypeScript backend in `backend/`: the Common Event Framework HTTP and Lambda adapter, auth middleware, command/query handlers, and the REST contract the frontend calls.

- Keep all backend-owned files in `backend/`. Change the root workspace only when a script is required to start it.
- Use Node.js 20, strict TypeScript, PostgreSQL in local Docker, TypeORM migrations, JWT, `bcryptjs`, and `zod` at the boundary.
- Keep the flow: CEF handler/parser → service (commands and queries) → repository → TypeORM → PostgreSQL.
- Treat `commoneventframework` as the OpenAPI, `CommonEvent`, CORS, local-dev, and Lambda adapter. Keep command handlers and the in-process domain-event dispatcher separate from that framework.
- Enforce JWT and role checks on every protected route. Validators alone may list all requests, list requesters, approve, and reject.
- Serve the agreed camelCase contract: auth, vacation requests, requester filter, and team planning. Return `{ code, message, details? }` with 400, 401, 403, 404, 409, and 500.
- Enforce business rules on the server: date order, no past start dates, pending-only transitions, a required rejection comment, and no overlap for pending or approved requests. Map exclusion-constraint violations to 409.
- Emit `VacationRequestCreatedEvent`, `VacationRequestApprovedEvent`, and `VacationRequestRejectedEvent` only after a successful transaction. Document that these in-process events are not durable.
- Seed the same demo accounts and sample requests as the frontend. Never log credentials or tokens.
- Do not add NestJS, Express, event sourcing, a message broker, or a second application server.
- Verify codegen, typecheck, tests, and build before handoff, and document setup, credentials, architecture, and limitations.

## Rules

Read these before changing backend or database code. This plan wins when a skill example uses a different framework.

- `.agents/skills/nodejs-backend-patterns/SKILL.md` — layered architecture, validation, custom errors, and API errors. Use `references/details.md` for middleware, error classes, and response shape, and `references/advanced-patterns.md` for JWT and transactions. Do not add Express, Fastify, a DI container, caching, or rate limiting; Common Event Framework is the HTTP adapter.
- `.agents/skills/typeorm/SKILL.md` — entities, repositories, query builder, migrations, transactions, and indexes. Skip the NestJS section.
- `.agents/skills/supabase-postgres-best-practices/SKILL.md` — schema, constraints, foreign-key indexes, pagination, short transactions, and connection limits. Load the matching file in `references/` before changing SQL. Authorization stays JWT and role checks in the application; do not add Row-Level Security, queues, or vector search.
