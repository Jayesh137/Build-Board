# BuildTracker MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the full BuildTracker MVP — a web app for managing a UK self-build house project covering timeline, budget, VAT reclaim, planning/CIL compliance, documents, contacts, decisions, inspections, diary, photos, snags, and a dashboard.

**Architecture:** pnpm monorepo with SvelteKit frontend (`apps/web`) and Hono REST API (`apps/api`). Shared database schema (`packages/db`) and utilities (`packages/shared`). Supabase for PostgreSQL, Auth, and Storage. See `ARCHITECTURE.md` for full details.

**Tech Stack:** SvelteKit 5 + Vite, Hono, TypeScript, Tailwind CSS 4, Drizzle ORM, Supabase, Zod, Vitest, Playwright

**Reference docs:** Read `PRD.md` and `ARCHITECTURE.md` in the project root before starting any task. They are the source of truth for all field definitions, API endpoints, database schema, and business rules.

---

## Phase 1: Foundation

### Task 1: Monorepo Scaffolding

**Goal:** Set up the monorepo structure so all four packages build and resolve each other.

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/index.ts`

**Steps:**

1. Initialise git repo and create root `package.json`:
```json
{
  "name": "build-tracker",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "db:generate": "pnpm --filter @buildtracker/db generate",
    "db:migrate": "pnpm --filter @buildtracker/db migrate",
    "db:seed": "pnpm --filter @buildtracker/db seed"
  },
  "devDependencies": {
    "turbo": "^2",
    "typescript": "^5.7"
  },
  "packageManager": "pnpm@9.15.0"
}
```

2. Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

3. Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".svelte-kit/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

4. Create `packages/shared/package.json` with name `@buildtracker/shared`, `packages/db/package.json` with name `@buildtracker/db`. Both should have `"main": "./src/index.ts"` and list `typescript` as devDependency.

5. Create placeholder `src/index.ts` in both packages exporting an empty object.

6. Create `.env.example` with all env vars from `ARCHITECTURE.md` (Deployment section).

7. Create `.gitignore` (node_modules, dist, .svelte-kit, .env, .turbo).

8. Run `pnpm install` to bootstrap workspaces.

9. Verify: `pnpm turbo build` completes without errors.

10. Commit: `git init && git add -A && git commit -m "feat: monorepo scaffolding with pnpm workspaces + turborepo"`

---

### Task 2: Shared Package — Types, Zod Schemas, Utilities

**Goal:** Build `packages/shared` with all types, Zod validation schemas, VAT classification rules, CIL validation rules, and utility functions. This package is imported by both the API and the frontend.

**Files:**
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/schemas.ts`
- Create: `packages/shared/src/vat-rules.ts`
- Create: `packages/shared/src/cil-rules.ts`
- Create: `packages/shared/src/currency.ts`
- Create: `packages/shared/src/dates.ts`
- Create: `packages/shared/src/index.ts`
- Test: `packages/shared/src/__tests__/vat-rules.test.ts`
- Test: `packages/shared/src/__tests__/cil-rules.test.ts`
- Test: `packages/shared/src/__tests__/currency.test.ts`
- Test: `packages/shared/src/__tests__/dates.test.ts`

**Steps:**

1. Add `vitest` and `zod` as dependencies to `packages/shared`.

2. **Write failing tests for VAT rules** (`vat-rules.test.ts`). Test cases must cover:
   - `classify("bricks")` → `"yes"`
   - `classify("architect fee")` → `"no"`
   - `classify("fitted wardrobe")` → `"needs_review"`
   - `classify("scaffolding hire")` → `"no"`
   - `classify("solar PV panels")` → `"needs_review"`
   - `validateInvoice({ invoiceTotal: 30000, hasClaimantNameAddress: false })` → flags `"Invoice over £250 must show claimant name and site address"`
   - `validateInvoice({ invoiceTotal: 20000, hasClaimantNameAddress: true })` → no flags
   - `validateInvoice({ source: "contractor_vat_error" })` → flags `"Contractor incorrectly charged VAT"`

3. Run tests to verify they fail.

4. **Implement `vat-rules.ts`:** Keyword-based classification using the reclaimable/non-reclaimable/mixed lists from `PRD.md` Module 4. Export `classify(description: string): "yes" | "no" | "needs_review"` and `validateInvoice(entry): string[]` (returns array of flag messages).

5. Run tests to verify they pass.

6. **Write failing tests for CIL rules** (`cil-rules.test.ts`). Test cases:
   - `canCommence([])` (no steps) → `{ allowed: false }`
   - `canCommence([form7Part1: "confirmed", form6: "confirmed"])` → `{ allowed: true }`
   - `canCommence([form7Part1: "submitted", form6: "not_started"])` → `{ allowed: false, reason: "..." }`
   - `isCommencementAction("Site clearance / demolition")` → `true`
   - `getNextRequiredStep(steps)` → returns the next incomplete blocking step

7. Run tests to verify they fail.

8. **Implement `cil-rules.ts`:** Export `canCommence(steps: CILStep[]): { allowed: boolean; reason?: string }`, `isCommencementAction(taskTitle: string): boolean`, `getNextRequiredStep(steps: CILStep[]): CILStep | null`.

9. Run tests to verify they pass.

10. **Write failing tests for currency** (`currency.test.ts`):
    - `penceToPounds(15099)` → `"£150.99"`
    - `poundsToPence("150.99")` → `15099`
    - `formatBudget(50000000)` → `"£500,000.00"`

11. Implement `currency.ts` and verify tests pass.

12. **Write failing tests for dates** (`dates.test.ts`):
    - `daysUntil("2026-06-01", "2026-03-13")` → `80`
    - `isOverdue("2026-03-12", "2026-03-13")` → `true`
    - `formatDate("2026-03-13")` → `"13 Mar 2026"`
    - `subtractDays("2026-06-01", 14)` → `"2026-05-18"` (for order-by-date calc)

13. Implement `dates.ts` and verify tests pass.

14. **Create `types.ts`:** TypeScript types for all entities matching the DB schema in `ARCHITECTURE.md`. Use type aliases, not classes. Include: `Project`, `ProjectMember`, `Phase`, `Task`, `TaskDependency`, `BudgetCategory`, `BudgetEntry`, `VATEntry`, `PlanningCondition`, `CILStep`, `Document`, `Contact`, `Decision`, `DecisionOption`, `Inspection`, `DiaryEntry`, `Photo`, `Snag`, `ActivityLogEntry`, `Alert`, `AlertPriority`.

15. **Create `schemas.ts`:** Zod schemas for all API request bodies. One schema per create/update endpoint. E.g., `createTaskSchema`, `updateTaskSchema`, `createBudgetEntrySchema`, `createVATEntrySchema`, etc. Import and re-export from index.

16. **Update `index.ts`** to re-export everything.

17. Run full test suite: `pnpm --filter @buildtracker/shared test`

18. Commit: `feat: shared package with types, schemas, VAT/CIL rules, utilities`

---

### Task 3: Database Package — Drizzle Schema, Migrations, Seed Data

**Goal:** Build `packages/db` with the full Drizzle schema matching `ARCHITECTURE.md`, generate migrations, and write the seed script.

**Files:**
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/relations.ts`
- Create: `packages/db/src/seed.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/drizzle.config.ts`

**Steps:**

1. Add dependencies: `drizzle-orm`, `drizzle-kit`, `postgres` (pg driver), `dotenv`.

2. **Create `schema.ts`:** Translate every `CREATE TABLE` from `ARCHITECTURE.md` into Drizzle `pgTable` definitions. Use `uuid` for IDs with `defaultRandom()`, `integer` for pence amounts, `text` with enums for status fields, `timestamp` for dates with timezone. Export every table.

3. **Create `relations.ts`:** Define Drizzle relations (one-to-many, many-to-many) for: project→phases, phase→tasks, task→dependencies, project→budgetCategories, category→entries, project→vatEntries, project→planningConditions, project→cilSteps, project→documents, project→contacts, project→decisions, decision→options, project→inspections, project→diaryEntries, diaryEntry→photos, project→snags, project→activityLog.

4. **Create `drizzle.config.ts`:** Point to schema.ts, use `DATABASE_URL` env var, output to `./drizzle/migrations`.

5. Generate migration: `pnpm drizzle-kit generate`

6. Verify migration SQL was created in `packages/db/drizzle/migrations/`.

7. **Create `seed.ts`:** This is the big one. Must include all pre-loaded reference data from `PRD.md`:

   a. **11 phases** (A through K) with names and sort order.

   b. **All tasks within each phase** — copy every row from the PRD timeline tables (Phase A through K). Set `is_milestone`, `inspection_required`, `sort_order` appropriately. Create dependency relationships matching the "Dependencies" column.

   c. **13 budget categories** with names, typical percentages, and sort order. Copy from PRD Module 3 budget structure table.

   d. **Default inspections** — copy from PRD Module 9. Set `type` (building_control/warranty), link to tasks, set `is_custom = false`.

   e. **6 CIL steps** — Form 2, Liability Notice, Form 7 Part 1, Written confirmation, Form 6, Form 7 Part 2. Set `is_blocking` flags per PRD Module 5.

   f. **Barnet council contacts** — copy from PRD Module 7 pre-loaded contacts table.

   g. **Decision prompts** — copy from PRD Module 8 pre-loaded decision prompts table. Link to phases.

   Export a `seedProject(db, projectId)` function.

8. **Update `index.ts`** to re-export schema, relations, and seed.

9. Commit: `feat: database schema, migrations, and seed data`

---

### Task 4: API Foundation — Hono App, Middleware, Auth

**Goal:** Set up the Hono API with auth middleware, project-access middleware, health check, and the `/auth/me` endpoint. After this task, the API starts, connects to Supabase, and rejects unauthenticated requests.

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/lib/db.ts`
- Create: `apps/api/src/lib/supabase.ts`
- Create: `apps/api/src/lib/resend.ts`
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/middleware/project-access.ts`
- Create: `apps/api/src/middleware/logger.ts`
- Create: `apps/api/src/routes/auth.ts`
- Test: `apps/api/src/__tests__/middleware/auth.test.ts`

**Steps:**

1. Create `apps/api/package.json` with name `@buildtracker/api`. Dependencies: `hono`, `@hono/node-server`, `@hono/zod-validator`, `drizzle-orm`, `postgres`, `@supabase/supabase-js`, `resend`, `node-cron`, `sharp`, `dotenv`, `zod`. Dev: `vitest`, `typescript`, `tsx`. Add dependency on `@buildtracker/db` and `@buildtracker/shared`.

2. **Create `lib/db.ts`:** Initialise Drizzle with `postgres` driver using `DATABASE_URL`. Export `db` instance.

3. **Create `lib/supabase.ts`:** Initialise Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY`. Export client.

4. **Create `lib/resend.ts`:** Initialise Resend client. Export.

5. **Create `middleware/logger.ts`:** Simple request logger (method, path, status, duration).

6. **Create `middleware/auth.ts`:**
   - Extract `Authorization: Bearer <token>` from request header.
   - Call `supabase.auth.getUser(token)` to verify JWT and get user ID.
   - If invalid/missing → return 401.
   - Set `c.set('userId', user.id)` and `c.set('userEmail', user.email)` on Hono context.

7. **Write failing test for auth middleware:** Mock Supabase, verify 401 on missing token, 401 on invalid token, 200 on valid token with userId set.

8. Implement and verify tests pass.

9. **Create `middleware/project-access.ts`:**
   - Extract `projectId` from route params.
   - Query `project_members` for `(projectId, userId)`.
   - If not a member → return 403.
   - Set `c.set('projectId', projectId)`, `c.set('memberRole', role)`, `c.set('memberModules', modules)` on context.
   - Export helper: `requireRole(...roles: string[])` that checks `memberRole` and returns 403 if not in allowed list.

10. **Create `routes/auth.ts`:**
    - `GET /auth/me` → returns `{ userId, email, projects: [...] }` by querying `project_members` joined with `projects`.

11. **Create `src/index.ts`:** Hono app entry point.
    - Apply logger middleware globally.
    - Mount `/auth` routes (no project-access needed).
    - Create `/api/v1/projects/:projectId` group with auth + project-access middleware.
    - Health check: `GET /health` → `{ status: "ok" }`.
    - Start with `serve({ fetch: app.fetch, port: PORT })`.

12. Verify: `pnpm --filter @buildtracker/api dev` starts without errors.

13. Commit: `feat: API foundation with Hono, auth middleware, project-access`

---

### Task 5: Frontend Foundation — SvelteKit App, Auth, Layout

**Goal:** Set up the SvelteKit app with Supabase auth (login, signup, callback), the app shell (sidebar, top bar), the API client, and auth-guarded routing. After this task, a user can sign up, log in, and see an empty dashboard shell.

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/svelte.config.js`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/src/app.html`
- Create: `apps/web/src/app.css`
- Create: `apps/web/src/hooks.server.ts`
- Create: `apps/web/src/lib/api-client.ts`
- Create: `apps/web/src/lib/components/ui/Button.svelte`
- Create: `apps/web/src/lib/components/ui/Input.svelte`
- Create: `apps/web/src/lib/components/ui/Card.svelte`
- Create: `apps/web/src/lib/components/ui/Badge.svelte`
- Create: `apps/web/src/lib/components/ui/Modal.svelte`
- Create: `apps/web/src/routes/+layout.svelte`
- Create: `apps/web/src/routes/+layout.server.ts`
- Create: `apps/web/src/routes/+page.svelte` (dashboard placeholder)
- Create: `apps/web/src/routes/auth/login/+page.svelte`
- Create: `apps/web/src/routes/auth/login/+page.server.ts`
- Create: `apps/web/src/routes/auth/signup/+page.svelte`
- Create: `apps/web/src/routes/auth/signup/+page.server.ts`
- Create: `apps/web/src/routes/auth/callback/+server.ts`

**Steps:**

1. Scaffold SvelteKit app: `pnpm create svelte@latest apps/web` choosing Skeleton project, TypeScript, ESLint. Then add dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `tailwindcss`, `@tailwindcss/vite`. Add workspace deps: `@buildtracker/shared`.

2. Configure `svelte.config.js` with `adapter-vercel`.

3. Configure Tailwind in `vite.config.ts` and `app.css`.

4. **Create `hooks.server.ts`:** Supabase SSR auth helper. On every request, create a Supabase server client, refresh the session if needed, and attach `session` and `supabase` to `event.locals`.

5. **Create `api-client.ts`:** Typed fetch wrapper as shown in `ARCHITECTURE.md`. Export `createApiClient(authToken: string)` with methods: `get<T>`, `post<T>`, `patch<T>`, `del`, `uploadFile`. Use `API_URL` from env. Include proper error handling (throw on non-2xx with status and body).

6. **Create `+layout.server.ts` (root):** Check for session. If not authenticated and not on `/auth/*` path, redirect to `/auth/login`. If authenticated, call `api.get('/auth/me')` to get user role and project. Pass to layout.

7. **Create `+layout.svelte` (root):** Sidebar with navigation links for all 11 MVP modules (Timeline, Budget, VAT, Planning, Documents, Contacts, Decisions, Inspections, Diary, Photos, Snags). Top bar with project name and user avatar/logout. Main content area with `<slot />`. Mobile-responsive: sidebar collapses to hamburger menu on small screens.

8. **Create auth pages:** Login page with email/password form. Signup page. Both use SvelteKit form actions calling Supabase Auth. Callback server route handles the OAuth redirect.

9. **Create base UI components** (`Button`, `Input`, `Card`, `Badge`, `Modal`). Keep them simple — Tailwind-styled, reusable, typed props.

10. **Create `+page.svelte` (dashboard):** Placeholder with "Dashboard coming soon" and a card layout skeleton. This confirms the auth flow and layout work end-to-end.

11. Verify: `pnpm --filter @buildtracker/web dev` shows login page, can sign up via Supabase, redirects to dashboard shell after login.

12. Commit: `feat: SvelteKit frontend with auth, layout, API client, base UI components`

---

## Phase 2: Core Data Modules

Each task in this phase follows the same pattern:
1. Write the API service (business logic)
2. Write the API route (HTTP handlers)
3. Write tests for the service
4. Write the SvelteKit pages (server loaders + form actions + Svelte components)
5. Commit

### Task 6: Timeline & Phases Module

**Goal:** CRUD for phases and tasks, dependency tracking, milestone display, inspection trigger on task completion, CIL commencement blocking. This is the backbone module.

**API files:**
- Create: `apps/api/src/services/tasks.service.ts`
- Create: `apps/api/src/routes/phases.ts`
- Create: `apps/api/src/routes/tasks.ts`
- Test: `apps/api/src/__tests__/services/tasks.service.test.ts`

**Frontend files:**
- Create: `apps/web/src/routes/timeline/+page.svelte`
- Create: `apps/web/src/routes/timeline/+page.server.ts`
- Create: `apps/web/src/routes/timeline/[taskId]/+page.svelte`
- Create: `apps/web/src/routes/timeline/[taskId]/+page.server.ts`
- Create: `apps/web/src/lib/components/TaskRow.svelte`
- Create: `apps/web/src/lib/components/MilestoneCard.svelte`
- Create: `apps/web/src/lib/components/StatusBadge.svelte`

**API service logic (`tasks.service.ts`):**
- `listPhases(projectId)` — return all phases with nested tasks, ordered by sort_order
- `getTask(taskId)` — return task with dependencies and linked inspection
- `createTask(phaseId, data)` — validate with Zod schema, insert, log activity
- `updateTask(taskId, data)` — the complex one:
  - If status changing to `in_progress` or `done`, check if task is a construction phase task and run `canCommence()` from CIL rules. Block if CIL not ready.
  - If status changing to `done` and `inspection_required = true`, set linked inspection to `due` status. Return warning message.
  - If status changing to `done`, check if any dependent tasks can now unblock.
  - Log activity.
- `deleteTask(taskId)` — soft delete or hard delete, remove dependencies

**Tests (`tasks.service.test.ts`):**
- Test: completing a task with `inspection_required = true` sets inspection to `due`
- Test: completing a Phase B task when CIL is incomplete returns `blocked: true`
- Test: completing a Phase B task when CIL is complete succeeds
- Test: completing a task unblocks dependent tasks

**API routes:** Map to endpoints from `ARCHITECTURE.md` Timeline section. Use `requireRole('owner')` for create/delete. Use Zod validators from shared package.

**Frontend:**
- **List view** (`+page.svelte`): Phases as collapsible sections. Tasks as rows with: title, status badge, assignee, due date, milestone marker. Filter bar: by phase, status, assignee. "Add task" button (owner only).
- **Task detail** (`[taskId]/+page.svelte`): Full task card with all fields. Edit form (SvelteKit form actions). Shows dependencies (what this task depends on, what depends on this). Shows linked inspection status. Notes field.
- **StatusBadge component:** Colour-coded badge for task status (not_started=grey, in_progress=blue, blocked=red, done=green).
- **MilestoneCard:** Diamond marker with milestone name and countdown.

Commit: `feat: timeline & phases module (API + frontend)`

---

### Task 7: Contacts Directory Module

**Goal:** CRUD for contacts with role, insurance expiry alerts, qualifications, and pinning. Simpler module — good to build next to establish the CRUD pattern.

**API files:**
- Create: `apps/api/src/routes/contacts.ts`
- Test: `apps/api/src/__tests__/routes/contacts.test.ts`

**Frontend files:**
- Create: `apps/web/src/routes/contacts/+page.svelte`
- Create: `apps/web/src/routes/contacts/+page.server.ts`
- Create: `apps/web/src/routes/contacts/[id]/+page.svelte`
- Create: `apps/web/src/routes/contacts/[id]/+page.server.ts`

**API:** Standard CRUD per `ARCHITECTURE.md` Contacts endpoints. Owner-only for create/update/delete. All members for read. `contract_value` field excluded from response for non-owner roles.

**Frontend:**
- Contact list grouped by role type, pinned contacts at top.
- Contact card: name, role, company, phone (quick-call link), email (quick-email link), insurance expiry (with warning badge if < 30 days), qualifications, rating (1-5 stars), notes.
- Add/edit form.

Commit: `feat: contacts directory module (API + frontend)`

---

### Task 8: Budget & Finances Module

**Goal:** Budget categories, quote/invoice/payment tracking, budget vs actuals, contingency tracking, visualisations.

**API files:**
- Create: `apps/api/src/services/budget.service.ts`
- Create: `apps/api/src/routes/budget.ts`
- Test: `apps/api/src/__tests__/services/budget.service.test.ts`

**Frontend files:**
- Create: `apps/web/src/routes/budget/+page.svelte`
- Create: `apps/web/src/routes/budget/+page.server.ts`
- Create: `apps/web/src/routes/budget/entries/+page.svelte`
- Create: `apps/web/src/routes/budget/entries/+page.server.ts`
- Create: `apps/web/src/routes/budget/entries/new/+page.svelte`
- Create: `apps/web/src/routes/budget/entries/new/+page.server.ts`
- Create: `apps/web/src/lib/components/BudgetBar.svelte`

**API service (`budget.service.ts`):**
- `getBudgetOverview(projectId)` — return categories with: allocated, spent (sum of paid invoices), committed (sum of accepted quotes not yet invoiced), remaining. Calculate contingency remaining. Calculate total spent vs total budget.
- `createEntry(categoryId, data)` — validate, insert. If entry is an invoice with VAT > 0 and source is `direct_purchase`, auto-create a VAT entry (call into VAT service).
- `getEntries(projectId, filters)` — filterable by type, category, status. Paginated.

**Tests:**
- Budget overview correctly sums spent, committed, remaining per category
- Contingency calculation: `total_budget * contingency_pct / 100 - sum(contingency_entries)`
- Auto-creation of VAT entry when invoice has VAT > 0

**Frontend:**
- **Overview page** (`+page.svelte`): Budget summary cards (total budget, total spent, committed, remaining, contingency). Bar chart per category (budget vs spent vs committed) using Layerchart. Contingency burn-down indicator (green/amber/red).
- **Entries list** (`entries/+page.svelte`): Table with filters by type, category, status. Shows: date, supplier, description, amount, VAT, status.
- **New entry form** (`entries/new/+page.svelte`): Category select, type (quote/invoice/payment), supplier, description, amount (£ input that converts to pence), VAT amount, receipt upload, notes.

Commit: `feat: budget & finances module (API + frontend)`

---

### Task 9: VAT Reclaim Tracker Module

**Goal:** VAT invoice logging with classification, validation flags, deadline countdown, HMRC export.

**API files:**
- Create: `apps/api/src/services/vat.service.ts`
- Create: `apps/api/src/routes/vat.ts`
- Test: `apps/api/src/__tests__/services/vat.service.test.ts`

**Frontend files:**
- Create: `apps/web/src/routes/vat/+page.svelte`
- Create: `apps/web/src/routes/vat/+page.server.ts`
- Create: `apps/web/src/routes/vat/new/+page.svelte`
- Create: `apps/web/src/routes/vat/new/+page.server.ts`

**API service (`vat.service.ts`):**
- `getVATDashboard(projectId)` — return: total reclaimable VAT (sum of `vat_amount` where `reclaimable = 'yes'`), count by status (yes/no/needs_review), deadline date (completion cert date + 6 months), days until deadline, flagged entries.
- `createVATEntry(projectId, data)` — validate with Zod schema. Run `classify()` from shared VAT rules to auto-set `reclaimable`. Run `validateInvoice()` to generate flags. Store flags in `notes` field.
- `exportHMRC(projectId)` — generate CSV with columns matching HMRC VAT431NB schedule: invoice date, supplier name, supplier VAT number, description, net amount, VAT amount. Only include entries where `reclaimable = 'yes'` and `validated = true`.

**Tests:**
- Creating a VAT entry auto-classifies based on description
- Entries over £250 without claimant name/address are flagged
- Contractor VAT errors are flagged
- HMRC export only includes validated reclaimable entries
- Dashboard totals are correct

**Frontend:**
- **Dashboard** (`+page.svelte`): Reclaimable total (large number), deadline countdown (days remaining with colour), entries by status (yes/no/needs_review counts), flagged entries list. Export button.
- **New entry form** (`new/+page.svelte`): Supplier, invoice number, description, net amount, VAT amount, source dropdown (direct purchase / contractor zero-rated / contractor VAT error), receipt upload. After submission, show auto-classification result and any flags.

Commit: `feat: VAT reclaim tracker module (API + frontend)`

---

### Task 10: Planning / CIL / Conditions Tracker Module

**Goal:** Planning condition tracking, CIL self-build exemption workflow with blocking enforcement.

**API files:**
- Create: `apps/api/src/services/cil.service.ts`
- Create: `apps/api/src/routes/planning.ts`
- Test: `apps/api/src/__tests__/services/cil.service.test.ts`

**Frontend files:**
- Create: `apps/web/src/routes/planning/+page.svelte`
- Create: `apps/web/src/routes/planning/+page.server.ts`
- Create: `apps/web/src/routes/planning/conditions/[id]/+page.svelte`
- Create: `apps/web/src/routes/planning/conditions/[id]/+page.server.ts`

**API service (`cil.service.ts`):**
- `getCILStatus(projectId)` — return all CIL steps with status, next required step, overall commencement readiness.
- `updateCILStep(stepId, data)` — validate transitions (can't skip steps). If updating Form 7 Part 2 to submitted, check it's within 6 months of completion cert.
- `canCommence(projectId)` — the blocking check (already defined in shared, but service version queries DB).

**API routes:** Per `ARCHITECTURE.md` Planning / CIL endpoints.

**Frontend:**
- **Planning page** (`+page.svelte`): Three sections:
  1. **Planning Status** — application reference, status badge, link to Barnet Public Access, expiry date.
  2. **Conditions** — table of conditions with: number, description, type badge (pre-commencement = red, pre-occupation = amber, ongoing = blue), status, submission date, decision date. Click to edit.
  3. **CIL Workflow** — visual step-by-step checklist. Each step shows: form name, status, date submitted, date confirmed. Blocking steps have a lock icon. Clear "CANNOT COMMENCE" warning if blocking steps are incomplete. 3-year occupancy countdown (post-completion).

Commit: `feat: planning / CIL / conditions tracker module (API + frontend)`

---

### Task 11: Inspections Tracker Module

**Goal:** Configurable inspections linked to timeline tasks, auto-prompts, result tracking.

**API files:**
- Create: `apps/api/src/services/inspections.service.ts`
- Create: `apps/api/src/routes/inspections.ts`

**Frontend files:**
- Create: `apps/web/src/routes/inspections/+page.svelte`
- Create: `apps/web/src/routes/inspections/+page.server.ts`
- Create: `apps/web/src/routes/inspections/[id]/+page.svelte`
- Create: `apps/web/src/routes/inspections/[id]/+page.server.ts`

**API service:** CRUD plus: when inspection is updated to `passed`, unblock dependent tasks. When updated to `failed`, add note to linked task.

**Frontend:**
- **Inspection list** (`+page.svelte`): Table sorted by timeline order. Columns: name, type (BC/warranty/other), linked task, status, scheduled date, result. Status colour coding. Barnet BC note at top: "Same-day inspections available — call before 10am."
- **Inspection detail** (`[id]/+page.svelte`): Result entry form (pass/conditional/fail), notes, inspector, date. Checklist of what to have ready (pre-loaded per type from seed data). Photo upload for inspection evidence.

Commit: `feat: inspections tracker module (API + frontend)`

---

## Phase 3: Content Modules

### Task 12: Decisions Log Module

**Goal:** Decision tracking with options comparison, deadlines, lead times, order-by-date calculation.

**API files:**
- Create: `apps/api/src/routes/decisions.ts`

**Frontend files:**
- Create: `apps/web/src/routes/decisions/+page.svelte`
- Create: `apps/web/src/routes/decisions/+page.server.ts`
- Create: `apps/web/src/routes/decisions/[id]/+page.svelte`
- Create: `apps/web/src/routes/decisions/[id]/+page.server.ts`

**API:** CRUD for decisions + decision options. Auto-calculate `order_by_date = deadline - lead_time_days`. When option is chosen, set `is_chosen = true` on that option and update decision status to `decided`.

**Frontend:**
- **List** (`+page.svelte`): Filter by status, category. Sort by deadline. Show overdue decisions in red. Show order-by-date warnings.
- **Detail** (`[id]/+page.svelte`): Decision info, linked task, deadline, lead time, order-by date. Options list with side-by-side comparison (name, supplier, cost, pros, cons). "Choose this option" button. Attach images/links to options.

Commit: `feat: decisions log module (API + frontend)`

---

### Task 13: Documents Vault Module

**Goal:** File upload, folder organisation, tagging, search, required-documents checklist.

**API files:**
- Create: `apps/api/src/services/documents.service.ts`
- Create: `apps/api/src/routes/documents.ts`

**Frontend files:**
- Create: `apps/web/src/routes/documents/+page.svelte`
- Create: `apps/web/src/routes/documents/+page.server.ts`
- Create: `apps/web/src/lib/components/FileUpload.svelte`

**API service (`documents.service.ts`):**
- `upload(projectId, file, folder, tags)` — validate file type (allowlist from `ARCHITECTURE.md` Security section), validate file size (20MB max), upload to Supabase Storage at `{projectId}/documents/{folder}/{filename}`, create DB record.
- `getSignedUrl(docId)` — generate time-limited signed URL from Supabase Storage.
- `getRequiredDocuments(projectId)` — return list of expected documents (e.g., "Site insurance", "Gas Safe certificate") with uploaded/missing status.

**Frontend:**
- **Document browser** (`+page.svelte`): Left panel: folder tree (pre-built structure from PRD). Right panel: documents in selected folder. Each document shows: name, upload date, uploader, tags. Click to preview (PDF/image inline) or download. Drag-and-drop upload zone.
- **Required documents checklist**: Banner showing "X of Y required documents uploaded". Expandable list showing each required doc with tick/cross.
- **FileUpload component**: Drag-and-drop zone with file type hints, progress indicator, folder and tag selection.

Commit: `feat: documents vault module (API + frontend)`

---

### Task 14: Site Diary & Photos Module

**Goal:** Daily log entries, photo upload with tagging, calendar view, concealed works prompts.

**API files:**
- Create: `apps/api/src/services/photos.service.ts`
- Create: `apps/api/src/routes/diary.ts`
- Create: `apps/api/src/routes/photos.ts`

**Frontend files:**
- Create: `apps/web/src/routes/diary/+page.svelte`
- Create: `apps/web/src/routes/diary/+page.server.ts`
- Create: `apps/web/src/routes/diary/new/+page.svelte`
- Create: `apps/web/src/routes/diary/new/+page.server.ts`
- Create: `apps/web/src/routes/diary/[date]/+page.svelte`
- Create: `apps/web/src/routes/diary/[date]/+page.server.ts`
- Create: `apps/web/src/routes/photos/+page.svelte`
- Create: `apps/web/src/routes/photos/+page.server.ts`
- Create: `apps/web/src/lib/components/PhotoGrid.svelte`

**API photo service (`photos.service.ts`):**
- `upload(projectId, file, metadata)` — validate (10MB max, image types only), upload original to Supabase Storage, generate 400px-wide WebP thumbnail using Sharp, upload thumbnail, create DB record with both paths.
- `list(projectId, filters)` — filterable by room, phase, trade, type. Paginated. Return thumbnail URLs.

**Frontend:**
- **Diary calendar** (`+page.svelte`): Month grid showing which days have entries (dots). List of recent entries below.
- **New entry** (`new/+page.svelte`): Quick mode (weather dropdown, who was on site checkboxes, one-line progress, photos) and detailed mode (all fields from PRD Module 10). Date defaults to today.
- **Day view** (`[date]/+page.svelte`): Full diary entry for that date. Edit form. Photo gallery for that day.
- **Photo gallery** (`photos/+page.svelte`): Grid of thumbnails. Filter by room, phase, trade, type. Click thumbnail for full-resolution. Tag editing.
- **Concealed works prompt**: When current phase is "First Fix", show banner on diary page: "Remember to photograph all pipes, wires, and insulation BEFORE they are covered."

Commit: `feat: site diary & photos module (API + frontend)`

---

### Task 15: Snag List Module

**Goal:** Defect tracking with photos, contractor assignment, resolution flow, shareable contractor link, defect liability tracking.

**API files:**
- Create: `apps/api/src/routes/snags.ts`

**Frontend files:**
- Create: `apps/web/src/routes/snags/+page.svelte`
- Create: `apps/web/src/routes/snags/+page.server.ts`
- Create: `apps/web/src/routes/snags/new/+page.svelte`
- Create: `apps/web/src/routes/snags/new/+page.server.ts`
- Create: `apps/web/src/routes/snags/[id]/+page.svelte`
- Create: `apps/web/src/routes/snags/[id]/+page.server.ts`
- Create: `apps/web/src/routes/snags/share/[token]/+page.svelte`
- Create: `apps/web/src/routes/snags/share/[token]/+page.server.ts`

**API:**
- Standard CRUD. On create, generate `share_token` (crypto random hex, 32 chars).
- `GET /share/:token` — public endpoint, no auth. Returns snags for the project filtered by the contractor linked to that token. Used for shareable contractor view.
- PDF export: generate snag report with photos for a specific contractor.

**Frontend:**
- **Snag list** (`+page.svelte`): Toggle between list view and kanban board (Open → Assigned → In Progress → Fixed → Verified). Filter by room, contractor, severity, category. Statistics bar: total, open, resolved.
- **Quick-add** (`new/+page.svelte`): Optimised for phone use. Large buttons, minimal fields: title, room dropdown, photo capture, severity. Fill details later.
- **Snag detail** (`[id]/+page.svelte`): All fields. Resolution workflow: add resolution photo, resolution notes, mark as fixed. Owner verification step.
- **Contractor share page** (`share/[token]/+page.svelte`): Public page (no login). Shows snags assigned to that contractor with photos. No edit capability — read-only.

Commit: `feat: snag list module (API + frontend)`

---

## Phase 4: Integration & Polish

### Task 16: Alerts Engine

**Goal:** Compute prioritised alerts across all modules and surface them on the dashboard and via scheduled email digests.

**API files:**
- Create: `apps/api/src/services/alerts.service.ts`
- Create: `apps/api/src/routes/alerts.ts`
- Create: `apps/api/src/routes/activity.ts`
- Create: `apps/api/src/jobs/scheduler.ts`
- Create: `apps/api/src/jobs/daily-alerts.ts`
- Create: `apps/api/src/jobs/deadline-reminders.ts`
- Create: `apps/api/src/services/email.service.ts`
- Test: `apps/api/src/__tests__/services/alerts.service.test.ts`

**API service (`alerts.service.ts`):** Implement the full `computeAlerts()` function from `ARCHITECTURE.md`. Query each module and generate alerts:

| Source | Alert | Priority |
|--------|-------|----------|
| Timeline | Overdue tasks | Critical |
| Timeline | Tasks due this week | Warning |
| Timeline | Upcoming milestones (14 days) | Info |
| Inspections | Inspection due before next task can proceed | Critical |
| Budget | Category over budget by >10% | Warning |
| Budget | Contingency < 10% remaining | Warning |
| Budget | Contingency < 5% remaining | Critical |
| VAT | Deadline within 30 days | Critical |
| VAT | Entries needing review | Warning |
| CIL | Blocking steps incomplete | Critical |
| CIL | Form 7 Part 2 deadline approaching | Critical |
| CIL | 3-year occupancy check | Info |
| Planning | Undischarged pre-commencement conditions | Critical |
| Contacts | Insurance expiring within 30 days | Warning |
| Decisions | Decision deadline within 14 days | Warning |
| Decisions | Order-by date within 7 days | Warning |
| Diary | No entry for 2+ working days during construction | Info |
| Snags | Defect liability period expiring within 30 days | Warning |

**Tests:** Test each alert source individually. Test priority sorting (critical first).

**Scheduled jobs:**
- `daily-alerts.ts`: Run at 8 AM, compute alerts for all projects, send email digest to owners via Resend.
- `deadline-reminders.ts`: Run at 9 AM, check high-stakes deadlines (VAT, CIL, insurance) and send targeted emails.

**Email service (`email.service.ts`):** Use Resend to send HTML emails. Simple template with alert list.

Commit: `feat: alerts engine with scheduled email digests`

---

### Task 17: Dashboard

**Goal:** The command centre page that shows project health at a glance. Depends on all other modules being built.

**Frontend files:**
- Modify: `apps/web/src/routes/+page.svelte` (replace placeholder)
- Modify: `apps/web/src/routes/+page.server.ts` (add data loading)

**Server loader (`+page.server.ts`):** Call multiple API endpoints in parallel:
- `GET /projects/:id` — project vitals
- `GET /projects/:id/alerts` — prioritised alerts
- `GET /projects/:id/budget` — budget summary
- `GET /projects/:id/tasks?status=in_progress&limit=5` — this week's tasks
- `GET /projects/:id/tasks?is_milestone=true&status=not_started&limit=3` — upcoming milestones
- `GET /projects/:id/planning` — undischarged conditions count
- `GET /projects/:id/vat` — VAT reclaim total
- `GET /projects/:id/snags?status=open` — open snags count
- `GET /projects/:id/decisions?status=not_started,researching` — pending decisions count

**Dashboard layout (`+page.svelte`):** Implement the layout from PRD Module 1:

- **Top strip:** Current phase, days into project, overall progress bar.
- **Left column:** Next 3 milestones with countdown, overdue tasks (red), this week's tasks, next inspection due.
- **Centre column:** Budget bar chart (budget/spent/committed/remaining), contingency indicator (green/amber/red), VAT reclaim total, monthly spend.
- **Right column:** Alert feed (scrollable, prioritised). Upcoming decisions.
- **Bottom strip:** Open snags, pending decisions, undischarged conditions.

All elements are clickable links to the relevant module.

Use Layerchart for budget bar chart and contingency indicator.

Commit: `feat: dashboard with project vitals, alerts, budget summary`

---

### Task 18: Seed Data, Project Setup Flow & Activity Log

**Goal:** When a new user signs up, they go through a project setup flow that creates their project and seeds all reference data. Activity log records all actions.

**API files:**
- Create: `apps/api/src/routes/projects.ts` (create project endpoint)
- Modify: `apps/api/src/routes/auth.ts` (add setup check)

**Frontend files:**
- Create: `apps/web/src/routes/setup/+page.svelte`
- Create: `apps/web/src/routes/setup/+page.server.ts`

**Setup flow:**
1. After first login, if user has no projects, redirect to `/setup`.
2. Setup page asks for: project name, address, total budget (optional), target completion date (optional).
3. On submit: API creates project, adds user as owner, runs `seedProject()` from `packages/db/seed.ts` to populate all phases, tasks, budget categories, inspections, CIL steps, contacts, decision prompts.
4. Redirect to dashboard.

**Activity log:** Ensure every service that creates/updates/deletes data also inserts into `activity_log`. The `GET /projects/:id/activity` endpoint returns paginated entries. Dashboard shows recent activity in the alert feed.

Commit: `feat: project setup flow, seed data, activity logging`

---

## Phase 5: Testing & Deployment

### Task 19: Integration & E2E Tests

**Goal:** Playwright E2E tests covering the critical user flows.

**Files:**
- Create: `tests/e2e/auth.spec.ts`
- Create: `tests/e2e/timeline.spec.ts`
- Create: `tests/e2e/budget.spec.ts`
- Create: `tests/e2e/vat.spec.ts`
- Create: `tests/e2e/planning.spec.ts`
- Create: `tests/e2e/snags.spec.ts`

**E2E test flows:**
1. **Auth:** Sign up → login → see dashboard → logout.
2. **Timeline:** View phases → open task → change status to done → see inspection prompt.
3. **Budget:** Add invoice → see budget update → check contingency.
4. **VAT:** Log VAT invoice → see auto-classification → see flag for missing address → export CSV.
5. **Planning/CIL:** Update CIL step → attempt to start Phase B task → see blocking error → complete all CIL steps → successfully start task.
6. **Snags:** Create snag with photo → assign to contractor → open share link → verify contractor sees it.

Commit: `test: E2E tests for critical user flows`

---

### Task 20: Deployment Configuration

**Goal:** Deploy both apps and verify everything works in production.

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `apps/web/vercel.json` (if needed)
- Modify: `apps/api/src/index.ts` (ensure production-ready)

**Steps:**
1. Set up Supabase project (production). Run migrations. Configure auth (enable email/password, set redirect URLs).
2. Create Supabase Storage bucket `buildtracker` with appropriate policies.
3. Set up Railway project for API. Connect to GitHub repo. Set environment variables. Deploy.
4. Set up Vercel project for frontend. Connect to GitHub repo. Set `API_URL` to Railway URL. Set Supabase env vars. Deploy.
5. Set up Resend with a sending domain.
6. Verify: sign up on production URL, create project, see seeded data, test all modules.
7. Set up Vercel preview deployments for PRs.

Commit: `chore: deployment configuration for Vercel + Railway`

---

## Summary

| Phase | Tasks | What You Get |
|-------|-------|-------------|
| **1. Foundation** | 1-5 | Monorepo, shared packages, DB schema, API skeleton with auth, SvelteKit with auth + layout |
| **2. Core Data** | 6-11 | Timeline, Contacts, Budget, VAT, Planning/CIL, Inspections — all with API + frontend |
| **3. Content** | 12-15 | Decisions, Documents, Diary/Photos, Snags — all with API + frontend |
| **4. Integration** | 16-18 | Alerts engine, Dashboard, Project setup + seed data |
| **5. Testing & Deploy** | 19-20 | E2E tests, production deployment |

**Total: 20 tasks.** Each task produces a working, committable increment. The app is usable after Phase 2 (core modules). Phase 3 adds the remaining content modules. Phase 4 ties everything together with the dashboard and alerts.
