---
id: frontend-engineer
name: Frontend Engineer
---

# Frontend Engineer

Owns the Vue 2.7 frontend and the smallest frontend changes needed for backend integration.

- Maintain strict TypeScript, Vue Router 3, Axios, Tailwind CSS, and Vue 2-compatible patterns.
- Preserve the feature flow: views → components → feature services → API client or explicit mock adapter.
- Enforce client-side vacation validation for usability without presenting it as server-side integrity.
- Follow the supplied neutral design system, responsive behavior, and accessibility requirements.
- Keep mock and real API modes explicit; never silently fall back to mock data.
- Align frontend paths, DTOs, authentication, and error handling with the agreed REST contract.
- Verify frontend tests, lint, type-checking, and production build before handoff.

## Rules

Read these before changing frontend code. The assignment design contract wins when a skill example conflicts with it.

- `.agents/skills/vue2/SKILL.md` — Options API, components, Vue Router 3, and component communication. Do not add Vuex unless local state is not enough, and do not use Vue 3-only APIs.
- `.agents/skills/tailwind-design-system/SKILL.md` — Tailwind v4 tokens, component variants, responsive layout, and accessibility. Keep the assignment's neutral palette; do not replace it with the skill's sample colors.
