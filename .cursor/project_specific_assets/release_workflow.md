# Release workflow (Git, worktrees, gates)

Canonical runbook for Release Engineer and cross-persona handoffs. Assignment plans live alongside this file in `.cursor/project_specific_assets/`.

## Branches

| Branch | Purpose |
|--------|---------|
| `develop` | Integration — all persona work merges here first. |
| `master` | Submission-ready only. Merges from `release/*` (or agreed doc-only fixes). |
| `feat/frontend-*` | Frontend Engineer |
| `feat/backend-*` | Backend/Middleware Engineer |
| `chore/integration-v1` | API wiring, proxy, env, real-mode client |
| `release/v1.0.0` | Stabilization — docs and fixes only, no new features |

**Tags:** `v0.1.0-mock` (frontend + backend scaffold, mock API); `v1.0.0` (full stack after release cut).

**Merge order toward v1.0.0:** backend → integration → release cut. Never put half-built backend on `master`.

## What Git tracks

- **Track:** `frontend/`, `backend/`, root tooling, `README.md`, `.cursor/project_specific_assets/`, `.cursor/personas/`.
- **Ignore:** `node_modules/`, `dist/`, `.env`, logs, OS/editor junk, backend build/codegen output; keep `.cursor/hooks/` and hook scripts local.
- **Default omit:** `.agents/`, `skills-lock.json` (not required for submission).

## Worktrees (one checkout per persona)

Set `REPO` to the primary clone (this repository).

| Persona | Directory | Initial branch | May edit |
|---------|-----------|----------------|----------|
| Release Engineer | `$REPO` | `develop`, then `release/*` | `.gitignore`, root `README.md`, root scripts, merges, tags, this file |
| Frontend Engineer | `../travelfactory-fe` | `feat/frontend-integration` | `frontend/**` |
| Backend/Middleware Engineer | `../travelfactory-be` | `feat/backend-impl` | `backend/**` |
| Integration | `../travelfactory-int` | `chore/integration-v1` | root workspace scripts, `frontend/vite.config.ts`, `frontend/.env.example`, integration-listed client files |

After Phase 0 commits exist on `develop`:

```bash
cd "$REPO"
git worktree add ../travelfactory-fe -b feat/frontend-integration develop
git worktree add ../travelfactory-be -b feat/backend-impl develop
git worktree add ../travelfactory-int -b chore/integration-v1 develop
```

Each worktree: run `npm install` locally. List worktrees: `git worktree list`.

## Phase 0 — Release Engineer (primary repo only)

Bootstrap readable history on `develop` (small commits aligned with frontend/backend placeholder plans):

1. Repo foundation: `.gitignore`, root monorepo tooling, plans + personas + this workflow doc.
2. Frontend toolchain, then design/shell, shared UI, API/mocks, features, tests.
3. Root + backend placeholder README; backend scaffold (package, tsconfig, docker, `.env.example`) — no `backend/src/` yet.

**Gate:** `npm install`, `npm run typecheck`, `npm run build` at repo root. Tag `v0.1.0-mock`; align `master` to same tip.

## Phase 1 — Backend (worktree `../travelfactory-be`)

Follow `vacation_management_backend_instructions.plan.md` todos in order. Merge `feat/backend-impl` → `develop` when:

- `docker compose up -d`, migrate, and seed succeed
- In `backend/`: `npm run typecheck`, `npm test`, `npm run build` pass

## Phase 2 — Integration (worktree `../travelfactory-int`)

Follow `frontend_backend_integration_plan.plan.md` sequence. Merge `chore/integration-v1` → `develop` after manual E2E checks in that plan (Verification section).

## Phase 3 — Release cut

In `$REPO`:

```bash
git checkout develop
git checkout -b release/v1.0.0
```

Run gates:

| Check | Action |
|-------|--------|
| Frontend | `npm run typecheck`, `npm run build` |
| Backend | In `backend/`: typecheck, test, build |
| Database | `db:up`, migrate, seed |
| E2E | **QA Engineer** (or assignee): full manual matrix in `.cursor/personas/qa-engineer.md`; real API + PostgreSQL |
| Docs | Re-run every command documented in `README.md` |
| Secrets | No `.env` in Git; only `.env.example` |

On `release/v1.0.0`, only `docs(release):`, `fix(release):`, `chore(release):` commits. Merge to `master`, tag `v1.0.0`, push `master`, `develop`, and tags when `origin` exists.

Before push from corporate network: `source "${HOME}/.cursor/cursor-network.sh" && apply_cursor_network`.

## Daily rules (every persona)

1. Work only in your worktree directory.
2. Rebase feature branch on `develop` before opening merge.
3. Commit prefix: `feat(frontend):`, `feat(backend):`, `chore:`, `docs:`, `fix(release):`.
4. Backend does not commit under `frontend/` (except integration branch scope). Frontend does not commit `backend/src/`.
5. Release Engineer merges to `master` and creates tags; sends feature fixes back to the owning persona.

## Handoff

Release Engineer verifies setup and docs against Frontend and Backend handoffs. Feature code changes go back to the owning engineer — Release Engineer does not implement product features.
