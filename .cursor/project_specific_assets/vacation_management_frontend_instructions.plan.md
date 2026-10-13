# Task: Build a Vacation Management Monorepo — Frontend First

Build a maintainable monorepo for the provided Web Development Intern Recruitment Test: Vacation Management Interface. Follow all assignment requirements and the Design System & Aesthetic Contract below.

## 1. Technology Stack

* **Frontend:** Vue 2.7, TypeScript, Vue Router 3, Axios, Tailwind CSS.
* **Backend:** Reserve an empty `backend/` directory with a placeholder README. Do not implement the backend.
* **Database (future backend):** PostgreSQL with TypeORM.
* **Event architecture (future backend):** commoneventframework.
* **Build tooling:** Vite configured for Vue 2.7 with compatible dependencies.
* **Package management:** npm workspaces for the monorepo.
* **Dependency management:** Pin compatible dependency versions and verify the actual installation, type-checking, and build. Do not mix Vue 2 and Vue 3 APIs or dependencies.

## 2. Required Monorepo Structure

Create the following structure. Adapt it only when necessary for compatibility or genuine implementation needs. Avoid generating unused placeholder files beyond the explicitly requested backend README.

```text
vacation-management/
├── frontend/
│   ├── public/
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
│   │   │   │   ├── AppModal.vue
│   │   │   │   ├── AppTable.vue
│   │   │   │   └── AppPagination.vue
│   │   │   └── layout/
│   │   │       ├── AppHeader.vue
│   │   │       ├── AppSidebar.vue
│   │   │       └── AppLayout.vue
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   ├── views/
│   │   │   │   │   └── LoginView.vue
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── vacation-requests/
│   │   │   │   ├── components/
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
│   │   │   │   │   └── RejectionDialog.vue
│   │   │   │   ├── views/
│   │   │   │   │   └── ApprovalDashboardView.vue
│   │   │   │   └── approvals.service.ts
│   │   │   └── team-planning/
│   │   │       ├── components/
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
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/
│   └── README.md
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

Create files only when they serve implemented functionality. Keep the backend directory empty apart from its README.

## 3. Frontend Functional Requirements

### Authentication and authorization
* Implement a login screen with seeded demo accounts for Requester and Validator roles.
* Support logout and role-aware navigation.
* Implement Vue Router navigation guards for authentication and role authorization.
* Keep authentication logic separate from UI components.
* Clearly document that mock authentication is for local demonstration only and is not production security.

### Requester interface
* Submit a vacation request with required start and end dates and an optional reason.
* Display the user's submitted requests, including Pending, Approved, and Rejected statuses.
* Provide team vacation planning accessible to both roles.
* Show loading, empty, success, validation, and error states.
* Prevent editing approved requests.

### Validator interface
* Display all vacation requests.
* Filter by status and requester.
* Implement pagination with page size, current page, total items, and total pages.
* Approve pending requests.
* Reject pending requests only after providing a required comment.
* Display rejection comments and request details.
* Ensure the UI updates consistently after successful actions.

### Business rules
Implement client-side validation for usability, while documenting that the future backend must enforce every rule independently:
1. End date must be after start date.
2. Requests for the same user cannot overlap.
3. Approved requests cannot be modified.
4. Requests with past start dates are not allowed.
5. Rejection requires a non-empty comment.
6. Only validators can approve or reject requests.

Treat date boundaries consistently and avoid timezone-related off-by-one errors. Handle concurrent requests and overlapping approvals as backend responsibilities; do not imply that client-side checks guarantee data integrity.

## 4. TypeScript and Vue 2 Best Practices

Use strict TypeScript and idiomatic Vue 2.7 patterns.
* Enable `strict: true` and avoid `any`, using `unknown` with appropriate narrowing when necessary.
* Define explicit domain types for User, UserRole, VacationRequest, VacationStatus, pagination, API responses, and API errors.
* Use typed component props and events, with explicit prop validation and event payloads.
* Use Vue 2-compatible component patterns. Do not use Vue 3-only APIs such as `defineProps`, `defineEmits`, `<script setup>`, or Vue Router 4.
* Prefer simple class-style or supported Vue 2.7 Composition API patterns where compatible with the selected tooling. Choose one primary approach and apply it consistently.
* Keep components focused and reusable.
* Avoid unnecessary global state; use local state and props/events where sufficient.
* Introduce Vuex only if genuinely needed.
* Keep business rules in reusable validation/domain utilities, not duplicated across templates.
* Avoid unsafe type assertions and non-null assertions unless justified.
* Validate untrusted API or mock data at runtime where appropriate; TypeScript types alone do not validate external data.
* Use consistent naming, explicit interfaces, and documented non-obvious decisions.

## 5. API and Data Layer

Create a centralized Axios client with a configurable base URL, request timeout, and consistent error handling.

Define typed service methods for:
* Login and retrieving the current user.
* Creating a vacation request.
* Retrieving the current user's requests.
* Retrieving all requests with filters and pagination.
* Approving and rejecting requests.
* Retrieving team vacation planning data.

Keep feature services separate from components. Define request/response DTOs and API contracts that can map cleanly to a future REST backend.

Use a mock adapter or service implementation behind the same contracts so the frontend can run before the backend exists. Seed realistic demo data for both roles.

Do not silently fall back to mock data after arbitrary API errors. Make mock mode explicit and configurable. Clearly distinguish simulated behavior from real persistence.

## 6. Frontend Architecture

Use feature-based modular organization:
* `components/common`: reusable UI primitives.
* `components/layout`: application shell and navigation.
* `features/auth`: login and authentication.
* `features/vacation-requests`: request creation, listing, and validation.
* `features/approvals`: manager dashboard, filtering, and decisions.
* `features/team-planning`: shared vacation overview.
* `router`: route definitions and access guards.
* `services`: Axios client and shared API contracts.
* `mocks`: deterministic local demo data and mock implementation.
* `types`: shared domain types.
* `utils`: reusable pure utilities.

Maintain the dependency direction:
**Views → Feature components → Feature services → API client or mock adapter**

Keep data fetching and business logic out of presentational components. Avoid circular dependencies and unnecessary abstractions.

## 7. Design System & Aesthetic Contract

The supplied design system is mandatory. Adapt its minimalist architectural portfolio aesthetic to a vacation management dashboard; do not build a portfolio or introduce unrelated AI features.

### Visual philosophy
* Use strictly neutral greys with no red, pink, magenta, purple, or yellow undertones in neutral surfaces.
* Alternate white `#FFFFFF` and whisper grey `#FBFCFD`.
* Use whisper-soft borders `#F1F3F6`; hover borders use `#E3E6EA`.
* Favor clear typography, disciplined whitespace, restrained cards, and subtle dividers.
* Use calm interactions and smooth transitions. Avoid aggressive animation, heavy shadows, excessive whitespace, and layout shifts.

### Design tokens
Define reusable CSS custom properties and map them into Tailwind:
```javascript
colors: {
  bg: '#FFFFFF',
  'bg-alt': '#FBFCFD',
  surface: '#FFFFFF',
  border: '#F1F3F6',
  'border-hover': '#E3E6EA',
  text: '#0F172A',
  'text-muted': '#475569',
  'text-subtle': '#64748B',
  accent: '#0F172A',
  'accent-hover': '#334155',
  'accent-soft': '#F8F9FB',
  'accent-muted': '#F1F3F6',
  success: '#16A34A',
  neutral: {
    50: '#FBFCFD',
    100: '#F6F7F9',
    200: '#EFF1F4',
    300: '#E3E6EA',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
}
```
Ensure the configuration syntax matches the selected Tailwind version. Do not copy configuration blindly if the installed version uses a different format.

### Typography
Use Plus Jakarta Sans, followed by system-ui, -apple-system, sans-serif.
* Page titles: `text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight`.
* Section headings: `text-2xl sm:text-3xl font-bold uppercase tracking-tight leading-tight`.
* Card titles: `text-base sm:text-lg font-semibold tracking-tight`.
* Body: `text-sm sm:text-base leading-relaxed`.
* Metadata: `text-xs sm:text-sm text-text-muted`.
* Section labels: `text-[11px] font-mono tracking-widest`.
Use typographic section labels such as `01 / MY REQUESTS` and `02 / TEAM PLANNING`. Numbers must never appear inside boxes, badges, pills, or decorative borders.

### Layout and spacing
* Main sections: `max-w-6xl mx-auto px-6 md:px-8`.
* Page introduction: `pt-20 sm:pt-24 pb-10 sm:pb-14`, without forced full-viewport vertical centering.
* Major sections: `py-14 md:py-20 border-t border-border`.
* Section header to content gap: `mb-8 sm:mb-12`.
* Alternate white and `bg-bg-alt` backgrounds where useful.
* Keep forms and data tables compact, legible, and responsive.

### Buttons and inputs
**Primary button baseline:**
`inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-neutral-50 text-text border border-border/80 hover:border-neutral-300 text-xs sm:text-sm font-medium rounded-xl transition-all active:scale-[0.98]`

**Ghost button baseline:**
`inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-text-muted hover:text-text bg-transparent hover:bg-neutral-100/80 border border-transparent hover:border-border/60 rounded-xl transition-all active:scale-[0.98]`

Adapt these classes to actual Tailwind version support. Buttons, forms, tables, dialogs, filters, and pagination must share consistent visual conventions. Statuses must not rely on color alone.

### Motion and interaction
* Use subtle transitions for hover, focus, dialogs, and expanding content.
* Prefer gentle spring-like motion where compatible with Vue 2.
* Avoid aggressive pings, scale jumps, heavy shadows, and abrupt content expansion.
* Use Vue-compatible transitions rather than React-specific `motion.div` or Framer Motion APIs.
* For expanding content, animate height from 0 to auto with `overflow: hidden` when practical.
* Respect `prefers-reduced-motion`.

### Accessibility and responsive behavior
* Use semantic HTML, visible keyboard focus, appropriate contrast, accessible labels, and keyboard-accessible dialogs.
* Make forms, tables, filters, navigation, and pagination work on mobile and desktop.
* Keep the visual system consistent without sacrificing usability or data density.

### Strict anti-patterns
* No gradients or decorative visual clutter.
* No boxed section numbers or badge-style section headers.
* No muddy or tinted neutral greys outside the defined palette.
* No excessive shadows or oversized empty hero areas.
* No aggressive blinking, radar rings, or jarring animations.
* No portfolio-specific AI floating widget, social-link groups, or unrelated features.
* No React-only components or animation APIs.

## 8. Backend Placeholder

Create only:
```text
backend/
└── README.md
```

The README should explain that the backend is intentionally unimplemented and is planned to use Node.js, PostgreSQL, TypeORM, REST endpoints, role-based authorization, and commoneventframework.

Document the intended command/event architecture with examples such as:
* `CreateVacationRequestCommand`
* `ApproveVacationRequestCommand`
* `RejectVacationRequestCommand`
* `VacationRequestApprovedEvent`
* `VacationRequestRejectedEvent`

Do not create backend source files, install backend dependencies, or claim that database persistence, JWT authentication, or server-side authorization already works.

## 9. Root README and Deliverables

Create a useful root `README.md` covering:
* Project overview and monorepo structure.
* Prerequisites and installation.
* How to start the frontend locally.
* How to configure mock mode.
* Demo account credentials and roles.
* Architecture and key technical decisions.
* Design system implementation.
* Type-check and build commands.
* Known limitations and future backend integration.

Use npm workspaces and root scripts where practical, for example `npm run dev`, `npm run typecheck`, and `npm run build`.

Add a `.gitignore` for dependencies, environment files, build artifacts, logs, and editor-specific files. Never commit secrets.

## 10. Execution Workflow

1. Inspect the existing repository and preserve any relevant work.
2. Verify Vue 2.7, Vite, TypeScript, Vue Router, and Tailwind compatibility before choosing dependency versions.
3. Establish the monorepo and strict TypeScript configuration.
4. Implement the shared design tokens and application shell.
5. Implement authentication, requester workflows, validator workflows, and team planning.
6. Add typed services and an explicit mock adapter.
7. Test business-rule validation, role guards, filtering, pagination, and rejection comments.
8. Run the available type checks and production build; fix all discovered issues.
9. Review the interface against the design contract and check responsive behavior.
10. Update the README with verified commands, actual demo credentials, and honest limitations.

Keep the scope appropriate for a 2–3 hour take-home assignment. Prioritize correct behavior, maintainability, type safety, and a polished but restrained UI over unnecessary abstractions.

At completion, report the implemented features, key architectural decisions, commands actually verified, and any remaining limitations. Never claim that a check or feature works unless it has been implemented and verified.

## 11. Tooling and Configuration Requirements

Use the supplied Vite, TypeScript, Tailwind CSS, and ESLint configurations as references. Adapt only what is applicable to this Vue 2.7 + TypeScript application. Do not copy React-specific or component-library-specific configuration.

### Vite
* Configure Vite for Vue 2.7 using the appropriate Vue 2 plugin, such as `@vitejs/plugin-vue2`.
* Configure `@` as an alias to `frontend/src`, and add other aliases only when they improve clarity.
* Use environment variables for application configuration.
* Configure development and production builds for the application, not a published component library.
* Do not add React plugins, library subpath entries, declaration-bundling plugins, CSS injection plugins, or library-mode output unless independently required.

### TypeScript
* Use strict type checking, with `noUnusedLocals`, `noUnusedParameters`, and `forceConsistentCasingInFileNames`.
* Use ES2020 or an appropriate modern target, DOM libraries, `isolatedModules`, and `noEmit` where compatible with the selected tooling.
* Use bundler-compatible module resolution only if supported by the selected TypeScript version and project setup; otherwise use the appropriate resolution mode for Vite and Vue 2.
* Configure TypeScript path aliases to match Vite aliases.
* Include Vue single-file components and the necessary Vue/Vite type declarations.
* Do not enable React JSX settings or add React-specific type packages.
* Ensure `vue-tsc` or the selected Vue 2-compatible type-checking solution actually supports the chosen Vue and TypeScript versions. Verify the type-check command rather than assuming compatibility.

### Tailwind CSS
* Use a Tailwind version compatible with the selected Vue 2/Vite setup and the supplied design tokens.
* Scan Vue single-file components, TypeScript files, HTML, and relevant styles for utility classes.
* Define the supplied neutral palette and CSS-variable-based design tokens.
* Use `foreground` rather than defining a custom color named `text`, so Tailwind's built-in `text-*` utilities remain unaffected.
* Add dark mode only if dark mode is actually implemented.
* Do not add Storybook content paths or unnecessary plugins.

### ESLint and formatting
* Configure linting for Vue single-file components and TypeScript using Vue-compatible ESLint tooling, such as `eslint-plugin-vue` and `@typescript-eslint` where supported.
* Apply appropriate Vue, TypeScript, accessibility, and general JavaScript best-practice rules.
* Integrate Prettier if useful and ensure the lint and formatting rules do not conflict.
* Do not include React, React Hooks, React Refresh, JSX-specific rules, React prop-types rules, or Storybook rules.
* Avoid excessive lint rules that slow development without materially improving this assignment.

### Dependency and compatibility rules
* Verify that every plugin and configuration option is compatible with Vue 2.7 and the selected versions of Vite, TypeScript, Tailwind CSS, and ESLint.
* Do not install dependencies solely because they appear in the reference configurations.
* Keep dependencies minimal and use consistent versions across the monorepo.
* Add root scripts for development, build, type-checking, and linting where practical.
* Run each configured command and resolve compatibility issues before declaring the project complete.