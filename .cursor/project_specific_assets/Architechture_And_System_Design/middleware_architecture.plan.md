---
name: middleware architecture
overview: HTTP pipeline (CEF), JWT guards, shared errors, and the browser API boundary between frontend and backend.
isProject: false
---

# Middleware architecture

Cross-cutting transport and auth — not vacation business rules (see [backend_architecture.plan.md](./backend_architecture.plan.md)).

## End-to-end (target local stack)

```mermaid
flowchart LR
  B[Browser]
  V[Vite :3000]
  CEF[CEF dev :8888]
  PG[(PostgreSQL)]

  B --> V
  V -->|"/api proxy when wired"| CEF
  CEF --> PG
```

Until integration lands, frontend mock and backend API can run separately ([frontend_backend_integration_plan.plan.md](./frontend_backend_integration_plan.plan.md)).

## Server: CEF request pipeline

Entry: `backend/src/index.ts` (`handler` + `startDevServer`).

```mermaid
flowchart TD
  E[Incoming event] --> CE[buildCommonEvent + root.yaml]
  CE --> R{Route match?}
  R -->|no| N404[404 NOT_FOUND]
  R -->|yes| O{OPTIONS?}
  O -->|yes| C204[204 CORS]
  O -->|no| P[inputParser]
  P -->|AppError| ERR[toErrorResponse]
  P --> H[handler]
  H --> J[JSON body + status]
  H -->|throws| ERR
  ERR --> J
```

| Piece | File | Role |
| --- | --- | --- |
| Routes | `src/root.yaml` | Path, method, parser/handler refs |
| Registry | `generated/HandlerRegistry.ts` | Generated — do not hand-edit |
| Guard | `auth/auth.guard.ts` | `guarded(roles, read)` → JWT + RBAC |
| HTTP utils | `shared/http.ts` | Body, query, Zod `parseWith`, `HttpResult` |
| Errors | `shared/errors.ts` | `{ code, message, details? }` |

## Protected route parser

```mermaid
flowchart TD
  EV[CommonEvent] --> A[authenticate Bearer JWT]
  A -->|missing/invalid| U401[401]
  A --> R{role in allowed list?}
  R -->|no| F403[403]
  R -->|yes| V[Zod validate body/query/path]
  V -->|fail| V400[400 ValidationError]
  V --> OUT["{ auth, …payload }"]
```

Public route: `POST /auth/login` (no `guarded` on parser).

## Client boundary

```mermaid
flowchart TD
  S[Feature service] --> AC[api-client]
  AC --> I{mock mode?}
  I -->|yes| M[mockApi]
  I -->|no| AX[Axios + interceptors]
  AX -->|request| T[Attach Bearer token]
  AX -->|4xx/5xx| REJ[Reject — no mock fallback]
  AX --> API[REST backend]
```

| Piece | File | Role |
| --- | --- | --- |
| HTTP client | `frontend/.../api-client.ts` | Mode switch, paths, token storage |
| UI guard | `router/guards.ts` | Redirects only — server enforces RBAC |

## Shared error shape

Both sides use `{ code, message, details? }`. Frontend: `getErrorMessage()` reads `message`.
