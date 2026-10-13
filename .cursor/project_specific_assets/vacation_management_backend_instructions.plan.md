---
name: backend implementation plan
overview: Implement a small TypeScript backend in `backend/` using the assignment’s required Common Event Framework as the HTTP/Lambda adapter, with TypeORM/PostgreSQL persistence, JWT/RBAC, command handlers, domain events, and focused tests. The API contract is aligned with the existing frontend (see `frontend_backend_integration_plan.plan.md`).
todos:
  - id: scaffold-backend
    content: Set up the strict TypeScript backend, CEF routing/entry point, environment config, and PostgreSQL service.
    status: pending
  - id: build-persistence
    content: Create TypeORM entities, migrations, constraints, repositories, and demo seed matching the frontend accounts.
    status: pending
  - id: implement-api
    content: Implement authentication, RBAC, vacation command/query handlers, domain events, and team planning.
    status: pending
  - id: verify-document
    content: Add focused tests, run all backend checks, and document setup, architecture, credentials, and limitations.
    status: pending
isProject: false
---

# Backend implementation plan

## Scope and architecture
- Put all backend code in the existing [`backend/`](backend/) directory. It currently contains only a placeholder README; replace that README and add the application there. Do not create another backend folder or nest the app elsewhere.
- Keep backend-owned files inside that directory: source, `package.json`, TypeScript config, tests, `.env.example`, `docker-compose.yml`, and the backend README. Change the root workspace only if a script is required to start it.
- Use a feature-first **Layered Architecture**: Controller (CEF handler) → Service (commands and queries) → Repository (TypeORM) → PostgreSQL.
- Use Node.js 20 + strict TypeScript, PostgreSQL, TypeORM migrations, JWT, `bcryptjs`, and `zod` for boundary validation.
- Use `commoneventframework` for OpenAPI route registration, `CommonEvent` normalization, responses/CORS, its local dev server, and a Lambda-compatible entry point. The package is an AWS event/HTTP framework, not a domain-event bus, so command handlers and a small in-process domain-event dispatcher remain separate and explicit.
- Keep the dependency flow: CEF handler/parser → service → repository → TypeORM. Do not add NestJS, Express, event sourcing, or a message broker.

## Local PostgreSQL
- No remote or second application server. PostgreSQL runs locally in Docker and the Node backend connects to `localhost:5432`.
- Add [`backend/docker-compose.yml`](backend/docker-compose.yml) with one `postgres` service, a named volume, and credentials supplied through environment variables.
- Document `docker compose up -d`, migrations, and the demo seed as the database setup. A cloud database is out of scope.

## Proposed structure
- [`backend/src/index.ts`](backend/src/index.ts): environment loading, database startup, generated CEF registry, Lambda/local entry point, and centralized error mapping.
- [`backend/src/root.yaml`](backend/src/root.yaml): OpenAPI routes with `x-handler` and `x-inputParser`; generated registry remains framework-generated.
- [`backend/src/database/`](backend/src/database/): data source, `User` and `VacationRequest` entities, migrations, repositories, and an idempotent demo seed.
- [`backend/src/auth/`](backend/src/auth/): login parser/handler, password verification, JWT issuance/verification, and reusable role guard.
- [`backend/src/vacation-requests/`](backend/src/vacation-requests/): DTO schemas, commands, command handlers, queries, repository operations, and approval/rejection events.
- [`backend/src/team-planning/`](backend/src/team-planning/): monthly team calendar query (pending and approved requests) shared by both roles.
- [`backend/src/shared/`](backend/src/shared/): typed application errors and the minimal event dispatcher.

## API contract
Aligned with the frontend; see `frontend_backend_integration_plan.plan.md`. Enum values are uppercase (`REQUESTER`, `PENDING`, ...), and responses are camelCase DTOs produced by one mapper per entity.
- `POST /auth/login` and `GET /auth/me`.
- `POST /vacation-requests` and `GET /vacation-requests/me` for requesters.
- `GET /vacation-requests?status=&userId=&search=&page=&pageSize=` for validators, ordered deterministically and capped to a safe page size.
- `GET /users?role=REQUESTER` for validators, used by the requester filter.
- `PATCH /vacation-requests/:id/approve` and `PATCH /vacation-requests/:id/reject`; only pending requests can transition, and rejection requires a trimmed comment.
- `GET /team-planning?year=&month=` for either authenticated role, returning the frontend `TeamPlanningData` shape. It includes `PENDING` and `APPROVED` requests (rejected ones do not reserve dates) and omits private reasons and rejection comments.
- Return a consistent JSON error shape `{ code, message, details? }` and use 400/401/403/404/409/500 status codes appropriately.

## Database design
Use the assignment schema exactly, with TypeORM entities and a migration. Passwords are stored only as hashes. Enum values are uppercase so the database, API, and frontend need no mapping.

**users**
- `id`: UUID primary key
- `name`: string
- `email`: unique string
- `password`: hashed string
- `role`: `REQUESTER` or `VALIDATOR`
- `created_at`: timestamp

**vacation_requests**
- `id`: UUID primary key
- `user_id`: foreign key to `users.id`
- `start_date`: date
- `end_date`: date
- `reason`: optional text
- `status`: `PENDING`, `APPROVED`, or `REJECTED`
- `comments`: nullable text, required when status is `REJECTED`
- `created_at`: timestamp
- `updated_at`: timestamp

## Persistence and business rules
- Store dates as PostgreSQL `date` values and transport them as `YYYY-MM-DD` strings to avoid timezone drift.
- Add database enums, foreign keys, an `end_date > start_date` check, and indexes for user/status/created-time listing.
- Prevent concurrent overlaps with a PostgreSQL `daterange` exclusion constraint per user for active (`PENDING`/`APPROVED`) requests; rejected requests no longer reserve dates. Map constraint violations to HTTP 409.
- Reject past start dates in the command handler, use conditional/locked pending-only status transitions, expose no general update endpoint, and emit `VacationRequestCreatedEvent`, `VacationRequestApprovedEvent`, or `VacationRequestRejectedEvent` only after a successful transaction.

## Authentication and authorization
- Seed the same four demo accounts as the frontend mock data (same names and emails): three requesters and one validator, each with a hashed shared demo password, plus a few sample requests so mock and real modes look alike.
- Validate required environment variables at startup; issue short-lived bearer JWTs containing only user ID and role; return a generic login failure and never log credentials or tokens.
- Apply a shared authentication wrapper to every protected CEF handler and enforce validator-only decision/list routes server-side.

## Verification and documentation
- Add Node's built-in test runner tests for date ordering/past dates, overlap conflicts, role checks, status transitions, rejection comments, filters, and pagination; include one database-backed API smoke path against the Docker PostgreSQL service.
- Add backend scripts for dev, CEF code generation, migration, seed, test, typecheck, and build. The README states that Docker provides the local database and no separate database server is required.
- Document installation, environment setup, database lifecycle, demo credentials, endpoint examples, command/event flow, verified commands, and the known limitation that in-process events are not durable (an outbox would be the production upgrade).

## Implementation sequence
1. Scaffold backend package/configuration, CEF OpenAPI entry point, environment validation, and local PostgreSQL setup.
2. Add entities, migrations, exclusion constraint, repositories, and demo seed.
3. Implement auth/JWT/RBAC and consistent API errors.
4. Implement vacation commands/queries/events and the team-planning query.
5. Add focused tests, run codegen/typecheck/tests/build, then complete backend/root documentation.
