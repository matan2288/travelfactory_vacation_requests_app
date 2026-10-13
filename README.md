# Vacation Management

Solution for the **Web Development Recruitment Test: Vacation Management Interface**. Requesters submit vacation requests; validators approve or reject them.

- **Frontend:** Vue 2.7, strict TypeScript, Vue Router 3, Axios, Tailwind CSS (`frontend/`)
- **Backend:** Node.js, Common Event Framework (CEF), TypeORM, PostgreSQL in Docker (`backend/`, see [`backend/README.md`](backend/README.md))

---

## 1. Monorepo Overview & Structure

An npm workspace monorepo. The frontend is served by Vite from the repo root (`index.html` + `vite.config.ts`), which proxies `/api` to the backend.

```text
vacation-management/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── fonts/
│   │   │   └── styles/
│   │   │       ├── main.css
│   │   │       └── tokens.css
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AppButton.vue
│   │   │   │   ├── AppInput.vue
│   │   │   │   ├── AppLogo.vue
│   │   │   │   ├── AppModal.vue
│   │   │   │   ├── AppTable.vue
│   │   │   │   └── AppPagination.vue
│   │   │   └── layout/
│   │   │       ├── AppHeader.vue
│   │   │       ├── AppSidebar.vue
│   │   │       ├── AppLayout.vue
│   │   │       ├── RolePill.vue
│   │   │       └── SignedInAs.vue
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── views/
│   │   │   │   │   └── LoginView.vue
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── vacation-requests/
│   │   │   │   ├── components/
│   │   │   │   │   ├── RequestDetailsDialog.vue
│   │   │   │   │   ├── RequestSummary.vue
│   │   │   │   │   ├── VacationRequestForm.vue
│   │   │   │   │   ├── VacationRequestList.vue
│   │   │   │   │   └── VacationStatus.vue
│   │   │   │   ├── views/
│   │   │   │   │   └── MyRequestsView.vue
│   │   │   │   ├── vacation-requests.service.ts
│   │   │   │   ├── vacation-requests.types.ts
│   │   │   │   └── vacation-requests.validation.ts
│   │   │   ├── approvals/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ApprovalFilters.vue
│   │   │   │   │   └── DecisionDialog.vue
│   │   │   │   ├── views/
│   │   │   │   │   └── ApprovalDashboardView.vue
│   │   │   │   └── approvals.service.ts
│   │   │   └── team-planning/
│   │   │       ├── views/
│   │   │       │   └── TeamPlanningView.vue
│   │   │       └── team-planning.service.ts
│   │   ├── router/
│   │   │   ├── index.ts
│   │   │   └── guards.ts
│   │   ├── services/
│   │   │   ├── api-client.ts
│   │   │   └── api.types.ts
│   │   ├── mocks/
│   │   │   ├── mock-api.ts
│   │   │   └── mock-data.ts
│   │   ├── types/
│   │   │   ├── user.types.ts
│   │   │   └── common.types.ts
│   │   ├── utils/
│   │   │   ├── date.utils.ts
│   │   │   └── error.utils.ts
│   │   ├── App.vue
│   │   └── main.ts
│   ├── tests/
│   │   └── vacation-requests.validation.spec.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── backend/                  # CEF + TypeORM + PostgreSQL API (see backend/README.md)
│   ├── src/
│   ├── test/
│   ├── docker-compose.yml
│   └── README.md
├── index.html
├── vite.config.ts            # frontend dev server, /api proxy to localhost:8888
├── .env.example              # frontend env (VITE_API_BASE_URL, VITE_USE_MOCK_API)
├── MANUAL_TESTING.md
├── package.json
└── README.md
```

---

## 2. Installation & Running Locally

Prerequisites: **Node.js 20+**, **npm 9+**, and **Docker** (PostgreSQL runs in a container).

```bash
git clone <repo-url>
cd vacation-management
npm install                             # root + both workspaces

cp backend/.env.example backend/.env    # set JWT_SECRET to a random 32+ character string
npm run db:up                           # PostgreSQL 16 on localhost:5432
npm run db:migrate                      # schema, enums, constraints
npm run db:seed                         # demo users + sample requests (idempotent)
```

Then start both apps in two terminals:

```bash
npm run dev:backend                     # API on http://localhost:8888, Swagger UI at /doc
npm run dev:frontend                    # App on http://localhost:3000
```

Open http://localhost:3000. The frontend calls `/api`, which Vite proxies to the backend.

Other scripts:

| Script | Purpose |
| --- | --- |
| `npm run typecheck` | Type-check frontend and backend |
| `npm run test:backend` | Backend unit + DB-backed API tests (needs `db:up` + `db:migrate`) |
| `npm run build` | Production build of the frontend |
| `npm run build -w backend` | Bundle the backend (`backend/dist/index.js`, Lambda-ready) |

**Mock mode (no backend):** set `VITE_USE_MOCK_API=true` in a root `.env` (see [`.env.example`](.env.example)). The UI then uses an in-browser mock stored in `localStorage`, accepts any password, and shows a "Reset Demo Data" link in the footer. The default is real API mode.

A step-by-step test walkthrough for both roles is in [`MANUAL_TESTING.md`](MANUAL_TESTING.md).

---

## 3. Running Application

### Sign in

![Vacation Management sign-in screen](slide-screenshots/slide-04-login.png)

### Requester portal

![Requester vacation overview](slide-screenshots/slide-05-my-requests.png)

![New vacation request validation dialog](slide-screenshots/slide-06-new-request.png)

### Validator portal

![Validator approvals dashboard](slide-screenshots/slide-07-approvals.png)

![Vacation rejection dialog](slide-screenshots/slide-08-reject-dialog.png)

![Team vacation planning calendar](slide-screenshots/slide-09-team-planning.png)

---

## 4. Seeded Demo Accounts

All accounts use the password **`demo1234`**.

| Role | Name | Email |
| :--- | :--- | :--- |
| **REQUESTER** | Alex Morgan | `alex.requester@company.internal` |
| **REQUESTER** | Sarah Chen | `sarah.dev@company.internal` |
| **REQUESTER** | Marcus Vance | `marcus.eng@company.internal` |
| **VALIDATOR** | Elena Rostova | `elena.validator@company.internal` |

---

## 5. Business Rules Implemented

Each rule is checked in the UI for instant feedback and enforced again by the backend (server-side details in [`backend/README.md`](backend/README.md#architecture)):

1. **End date after start date:** `endDate > startDate`.
2. **No overlapping requests:** a user's requests cannot overlap their `PENDING` or `APPROVED` requests. Rejected requests free their dates.
3. **Approved requests are immutable:** no edit or re-decision once `APPROVED`.
4. **No past start dates:** the start date cannot be before today.
5. **Rejection requires a comment:** a non-empty comment is mandatory.
6. **Only validators decide:** approvals routes and actions are limited to the `VALIDATOR` role (router guards in the UI, JWT role checks on the API).

---

## 6. Technical Decisions

1. **Vue 2.7 + strict TypeScript:** Vue 2.7.16 with `strict: true`; no Vue 3-only syntax (`<script setup>`, `defineProps`) or Vue Router 4.
2. **Single API client:** all HTTP goes through [`api-client.ts`](frontend/src/services/api-client.ts) (Axios, bearer token, 401 redirect to login). `VITE_USE_MOCK_API` switches explicitly to the mock adapter; it never silently falls back on errors.
3. **Feature-based folders:** `features/auth`, `vacation-requests`, `approvals`, `team-planning`, keeping data fetching out of presentational components.
4. **Timezone-safe dates:** `YYYY-MM-DD` strings are parsed as integer year/month/day on both sides, avoiding UTC off-by-one shifts.
5. **Backend:** commands and domain events, overlap protection via a PostgreSQL exclusion constraint, and atomic status transitions. See [`backend/README.md`](backend/README.md#architecture).
6. **Minimal design:** neutral greys, typographic section labels, unboxed status text, and a small role pill for the signed-in user.

---

## 7. Known Limitations

- Department and vacation-balance fields exist only in mock mode; the API user has `id`, `name`, `email`, and `role`.
- Backend limitations (in-process events, server-timezone "today", stateless JWT without refresh or rate limiting, unscoped team planning) are listed in [`backend/README.md`](backend/README.md#known-limitations).
