# BuildBoard - Architecture

## System Overview

BuildBoard is a monorepo with two applications and two shared packages:

```
┌─────────────────────────────┐
│        Browser / Phone       │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────┐
│   SvelteKit (apps/web)       │
│   SSR, routing, UI, forms    │
│   Deployed on Vercel         │
└──────────────┬───────────────┘
               │ fetch (server-side)
               ▼
┌──────────────────────────────┐
│   Hono API (apps/api)        │
│   REST API, business logic,  │
│   file processing, cron jobs │
│   Deployed on Railway        │
└───────┬──────────┬───────────┘
        │          │
        ▼          ▼
┌────────────┐ ┌────────────┐
│  Supabase  │ │  Supabase  │
│  PostgreSQL│ │  Storage   │
│  + Auth    │ │  (files)   │
└────────────┘ └────────────┘
```

**Why a separate backend?**

SvelteKit server routes (`+page.server.ts`) are great for simple data loading, but this project needs:

- **Scheduled jobs** — daily alert emails, deadline reminders, insurance expiry warnings. Vercel serverless functions spin down between requests; you can't run persistent cron jobs.
- **Long-running operations** — PDF generation for VAT reclaim export and snag reports, photo thumbnail processing. Vercel has a 10-second timeout on the free tier.
- **Business logic isolation** — CIL blocking rules, VAT validation, inspection enforcement, dependency resolution. These belong in a testable API layer, not scattered across SvelteKit form actions.
- **Future clients** — if you ever build a mobile app, the API is already there.
- **Independent scaling** — the API can handle heavier operations without affecting page load times.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | SvelteKit (Svelte 5 + Vite) | SSR, file-based routing, form actions, fast page loads |
| **Backend API** | Hono (on Node.js) | TypeScript-first, lightweight, built-in Zod validation, fast |
| **Language** | TypeScript (everywhere) | One language across frontend, API, and shared packages |
| **Styling** | Tailwind CSS 4 | Utility-first, responsive, fast to build with |
| **Charts** | Layerchart (Svelte-native, D3-based) | Svelte-first charting for budget visualisations |
| **Database** | PostgreSQL via Supabase | Relational, multi-user, RLS for access control, free tier |
| **ORM** | Drizzle ORM | Type-safe queries, lightweight, shared schema between web and API |
| **File Storage** | Supabase Storage | Documents and photos, signed URLs, integrated with auth |
| **Auth** | Supabase Auth | Email/password + magic links, JWT tokens, integrates with RLS |
| **Image Processing** | Sharp | Photo thumbnail generation on upload |
| **PDF Generation** | @react-pdf/renderer or PDFKit | VAT reclaim export, snag list reports |
| **Scheduled Jobs** | node-cron | Daily alert digest, deadline reminders, insurance expiry checks |
| **Email** | Resend (free tier: 100/day) | Transactional emails for invites, alerts, reminders |
| **Validation** | Zod | Shared request/response schemas between frontend and API |
| **Monorepo** | pnpm workspaces + Turborepo | Single repo, shared packages, parallel builds |
| **Frontend Deployment** | Vercel (adapter-vercel) | Free tier, HTTPS, preview deploys |
| **API Deployment** | Railway | Persistent process for cron jobs, longer timeouts, free trial then $5/mo |

---

## Monorepo Structure

```
build-tracker/
├── apps/
│   ├── web/                          # SvelteKit frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/       # Svelte UI components
│   │   │   │   │   ├── ui/           # Base primitives (Button, Input, Card, Badge, Modal, etc.)
│   │   │   │   │   ├── AlertBanner.svelte
│   │   │   │   │   ├── BudgetBar.svelte
│   │   │   │   │   ├── FileUpload.svelte
│   │   │   │   │   ├── MilestoneCard.svelte
│   │   │   │   │   ├── PhotoGrid.svelte
│   │   │   │   │   ├── SearchBar.svelte
│   │   │   │   │   ├── StatusBadge.svelte
│   │   │   │   │   └── TaskRow.svelte
│   │   │   │   │
│   │   │   │   ├── api-client.ts     # Typed fetch wrapper for calling the Hono API
│   │   │   │   └── stores/           # Svelte stores (toast notifications, UI state)
│   │   │   │
│   │   │   ├── routes/               # SvelteKit file-based routing
│   │   │   │   ├── +layout.svelte    # Root layout: sidebar, top bar, auth guard
│   │   │   │   ├── +layout.server.ts # Session check, load project + user role from API
│   │   │   │   ├── +page.svelte      # Dashboard
│   │   │   │   ├── +page.server.ts   # Dashboard: calls API for vitals, alerts, budget summary
│   │   │   │   │
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/+page.svelte
│   │   │   │   │   ├── signup/+page.svelte
│   │   │   │   │   ├── invite/[token]/+page.svelte
│   │   │   │   │   └── callback/+server.ts
│   │   │   │   │
│   │   │   │   ├── timeline/
│   │   │   │   │   ├── +page.svelte            # List/board view
│   │   │   │   │   ├── +page.server.ts         # Load from API
│   │   │   │   │   └── [taskId]/+page.svelte   # Task detail
│   │   │   │   │
│   │   │   │   ├── budget/
│   │   │   │   │   ├── +page.svelte            # Budget overview
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   ├── entries/+page.svelte    # Invoice/payment list
│   │   │   │   │   └── entries/new/+page.svelte
│   │   │   │   │
│   │   │   │   ├── vat/
│   │   │   │   │   ├── +page.svelte            # VAT dashboard
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   └── new/+page.svelte        # Log VAT invoice
│   │   │   │   │
│   │   │   │   ├── planning/
│   │   │   │   │   ├── +page.svelte            # Conditions + CIL workflow
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   └── conditions/[id]/+page.svelte
│   │   │   │   │
│   │   │   │   ├── documents/
│   │   │   │   │   ├── +page.svelte            # Document browser
│   │   │   │   │   └── +page.server.ts
│   │   │   │   │
│   │   │   │   ├── contacts/
│   │   │   │   │   ├── +page.svelte
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   └── [id]/+page.svelte
│   │   │   │   │
│   │   │   │   ├── decisions/
│   │   │   │   │   ├── +page.svelte
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   └── [id]/+page.svelte
│   │   │   │   │
│   │   │   │   ├── inspections/
│   │   │   │   │   ├── +page.svelte
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   └── [id]/+page.svelte
│   │   │   │   │
│   │   │   │   ├── diary/
│   │   │   │   │   ├── +page.svelte            # Calendar view
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   ├── new/+page.svelte        # Quick or detailed entry
│   │   │   │   │   └── [date]/+page.svelte
│   │   │   │   │
│   │   │   │   ├── photos/
│   │   │   │   │   ├── +page.svelte            # Gallery with filters
│   │   │   │   │   └── +page.server.ts
│   │   │   │   │
│   │   │   │   ├── snags/
│   │   │   │   │   ├── +page.svelte            # Kanban/list toggle
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   ├── new/+page.svelte        # Quick-add (phone optimised)
│   │   │   │   │   ├── [id]/+page.svelte
│   │   │   │   │   └── share/[token]/+page.svelte  # Public contractor view (no auth)
│   │   │   │   │
│   │   │   │   └── settings/
│   │   │   │       └── +page.svelte            # Project settings, user management
│   │   │   │
│   │   │   ├── app.html
│   │   │   ├── app.css               # Tailwind imports
│   │   │   └── hooks.server.ts       # Auth session refresh on every request
│   │   │
│   │   ├── static/                   # Favicon, manifest
│   │   ├── svelte.config.js          # adapter-vercel
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # Hono backend API
│       ├── src/
│       │   ├── index.ts              # Hono app entry point, middleware, route mounting
│       │   │
│       │   ├── routes/               # API route handlers
│       │   │   ├── auth.ts           # POST /auth/invite, GET /auth/me
│       │   │   ├── projects.ts       # GET/PATCH /projects/:id
│       │   │   ├── tasks.ts          # CRUD /projects/:id/tasks
│       │   │   ├── phases.ts         # CRUD /projects/:id/phases
│       │   │   ├── budget.ts         # CRUD /projects/:id/budget (categories + entries)
│       │   │   ├── vat.ts            # CRUD /projects/:id/vat, GET /vat/export
│       │   │   ├── planning.ts       # CRUD /projects/:id/planning (conditions + CIL)
│       │   │   ├── documents.ts      # CRUD + upload /projects/:id/documents
│       │   │   ├── contacts.ts       # CRUD /projects/:id/contacts
│       │   │   ├── decisions.ts      # CRUD /projects/:id/decisions (+ options)
│       │   │   ├── inspections.ts    # CRUD /projects/:id/inspections
│       │   │   ├── diary.ts          # CRUD /projects/:id/diary
│       │   │   ├── photos.ts         # CRUD + upload /projects/:id/photos
│       │   │   ├── snags.ts          # CRUD /projects/:id/snags, GET /share/:token
│       │   │   ├── alerts.ts         # GET /projects/:id/alerts
│       │   │   ├── activity.ts       # GET /projects/:id/activity
│       │   │   └── export.ts         # GET /projects/:id/export/:module (CSV/PDF)
│       │   │
│       │   ├── middleware/
│       │   │   ├── auth.ts           # Verify Supabase JWT, extract user, attach to context
│       │   │   ├── project-access.ts # Check project membership + role permissions
│       │   │   └── logger.ts         # Request logging
│       │   │
│       │   ├── services/             # Business logic (called by routes, testable in isolation)
│       │   │   ├── alerts.service.ts       # Compute alerts across all modules
│       │   │   ├── budget.service.ts       # Budget calculations, contingency tracking
│       │   │   ├── vat.service.ts          # VAT classification, validation, HMRC export
│       │   │   ├── cil.service.ts          # CIL workflow validation, blocking logic
│       │   │   ├── tasks.service.ts        # Dependency resolution, inspection triggers
│       │   │   ├── inspections.service.ts  # Inspection status management, blocking logic
│       │   │   ├── photos.service.ts       # Upload, thumbnail generation, tagging
│       │   │   ├── documents.service.ts    # Upload, folder management
│       │   │   ├── export.service.ts       # PDF/CSV generation
│       │   │   └── email.service.ts        # Email sending via Resend
│       │   │
│       │   ├── jobs/                 # Scheduled background jobs
│       │   │   ├── scheduler.ts      # node-cron job registration
│       │   │   ├── daily-alerts.ts   # Daily email digest of overdue/upcoming items
│       │   │   ├── deadline-reminders.ts  # Specific deadline warnings (VAT, CIL, insurance)
│       │   │   └── cleanup.ts        # Activity log pruning, orphaned file cleanup
│       │   │
│       │   └── lib/
│       │       ├── db.ts             # Drizzle client initialisation
│       │       ├── supabase.ts       # Supabase client (storage, auth admin)
│       │       └── resend.ts         # Resend client
│       │
│       ├── tsconfig.json
│       ├── Dockerfile                # For Railway deployment
│       └── package.json
│
├── packages/
│   ├── db/                           # Shared database package
│   │   ├── src/
│   │   │   ├── schema.ts            # Drizzle table definitions (single source of truth)
│   │   │   ├── relations.ts         # Drizzle relation definitions
│   │   │   ├── seed.ts              # Seed data: phases, tasks, categories, inspections, contacts
│   │   │   └── index.ts             # Re-exports
│   │   ├── drizzle/
│   │   │   └── migrations/           # Generated migration SQL files
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── shared/                       # Shared types and utilities
│       ├── src/
│       │   ├── types.ts              # TypeScript types (inferred from Drizzle schema + API contracts)
│       │   ├── schemas.ts            # Zod validation schemas (used by both API and frontend)
│       │   ├── vat-rules.ts          # VAT reclaimable/non-reclaimable classification logic
│       │   ├── cil-rules.ts          # CIL step validation, blocking rules
│       │   ├── dates.ts              # Date formatting, deadline calculations
│       │   ├── currency.ts           # Pence ↔ pounds formatting
│       │   └── index.ts              # Re-exports
│       ├── tsconfig.json
│       └── package.json
│
├── turbo.json                        # Turborepo pipeline config
├── pnpm-workspace.yaml               # Workspace package definitions
├── package.json                      # Root: scripts, devDependencies
├── .env.example                      # Environment variable template
├── PRD.md
├── PRD_CHANGELOG.md
└── ARCHITECTURE.md
```

---

## How the Frontend Talks to the Backend

SvelteKit **server-side** code (in `+page.server.ts` loaders and form actions) calls the Hono API. The browser never talks to the API directly — SvelteKit acts as a BFF (Backend For Frontend).

```
Browser                    SvelteKit (Vercel)              Hono API (Railway)
  │                              │                               │
  │  GET /budget                 │                               │
  │────────────────────────────► │                               │
  │                              │  GET /projects/:id/budget     │
  │                              │  (with auth token)            │
  │                              │──────────────────────────────►│
  │                              │                               │ query DB
  │                              │                               │◄────────
  │                              │◄──────────────────────────────│ JSON
  │  HTML (SSR page)             │                               │
  │◄─────────────────────────────│                               │
```

**Why this pattern?**

- **No CORS** — API is only called server-to-server. No browser CORS configuration needed.
- **No API key in browser** — the Supabase service role key and API URL stay server-side.
- **SSR works** — pages render with data on the server. Fast initial load.
- **Progressive enhancement** — SvelteKit form actions work without JavaScript. Submit a budget entry from a phone with dodgy signal and it still works.
- **Future flexibility** — if a mobile app is built later, it calls the Hono API directly (with its own auth).

### API Client (apps/web)

A typed fetch wrapper in `src/lib/api-client.ts` handles all calls from SvelteKit to Hono:

```typescript
// apps/web/src/lib/api-client.ts
import type { Budget, Task, VATEntry } from '@buildtracker/shared';

const API_URL = process.env.API_URL; // e.g. https://buildboard-api.up.railway.app

export function createApiClient(authToken: string) {
  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  // ... patch, delete, uploadFile similarly

  return { get, post, patch, delete: del, uploadFile };
}
```

Used in SvelteKit loaders:

```typescript
// apps/web/src/routes/budget/+page.server.ts
import { createApiClient } from '$lib/api-client';

export async function load({ locals }) {
  const api = createApiClient(locals.session.access_token);
  const budget = await api.get(`/projects/${locals.projectId}/budget`);
  return { budget };
}
```

---

## API Design

### Base URL

```
https://buildboard-api.up.railway.app/api/v1
```

### Authentication

Every request (except `/share/:token` endpoints) must include a Supabase JWT:

```
Authorization: Bearer <supabase_access_token>
```

The `auth` middleware verifies the JWT with Supabase, extracts the user ID, and the `project-access` middleware checks their role in `project_members`.

### Endpoints

All endpoints are scoped to a project: `/projects/:projectId/...`

**Projects**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id` | Get project details | All members |
| PATCH | `/projects/:id` | Update project settings | Owner |

**Timeline**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/phases` | List all phases with tasks | All members |
| GET | `/projects/:id/tasks` | List tasks (filterable by phase, status, assignee) | All members |
| GET | `/projects/:id/tasks/:taskId` | Get task detail | All members |
| POST | `/projects/:id/tasks` | Create task | Owner |
| PATCH | `/projects/:id/tasks/:taskId` | Update task (status, dates, assignee, notes) | Owner, assigned collaborator |
| DELETE | `/projects/:id/tasks/:taskId` | Delete task | Owner |

**Budget**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/budget` | Budget overview (categories, totals, contingency) | Owner only |
| GET | `/projects/:id/budget/entries` | List entries (filterable by type, category, status) | Owner only |
| POST | `/projects/:id/budget/entries` | Create quote/invoice/payment | Owner only |
| PATCH | `/projects/:id/budget/entries/:entryId` | Update entry | Owner only |
| DELETE | `/projects/:id/budget/entries/:entryId` | Delete entry | Owner only |

**VAT Reclaim**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/vat` | VAT dashboard (totals, deadline, flagged items) | Owner only |
| GET | `/projects/:id/vat/entries` | List VAT entries | Owner only |
| POST | `/projects/:id/vat/entries` | Log new VAT invoice | Owner only |
| PATCH | `/projects/:id/vat/entries/:entryId` | Update/validate entry | Owner only |
| GET | `/projects/:id/vat/export` | Export HMRC-format CSV/PDF | Owner only |

**Planning / CIL**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/planning` | Planning status, conditions, CIL steps | All members |
| POST | `/projects/:id/planning/conditions` | Add condition | Owner |
| PATCH | `/projects/:id/planning/conditions/:condId` | Update condition status | Owner |
| PATCH | `/projects/:id/planning/cil/:stepId` | Update CIL step status | Owner |

**Documents**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/documents` | List documents (filterable by folder, tags) | All members |
| POST | `/projects/:id/documents` | Upload document (multipart) | Owner, Collaborator |
| GET | `/projects/:id/documents/:docId/url` | Get signed download URL | All members |
| DELETE | `/projects/:id/documents/:docId` | Delete document | Owner |

**Contacts**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/contacts` | List contacts | All members |
| POST | `/projects/:id/contacts` | Add contact | Owner |
| PATCH | `/projects/:id/contacts/:contactId` | Update contact | Owner |
| DELETE | `/projects/:id/contacts/:contactId` | Delete contact | Owner |

**Decisions**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/decisions` | List decisions (filterable) | All members |
| POST | `/projects/:id/decisions` | Create decision | Owner |
| PATCH | `/projects/:id/decisions/:decId` | Update decision | Owner |
| POST | `/projects/:id/decisions/:decId/options` | Add option | Owner |
| DELETE | `/projects/:id/decisions/:decId` | Delete decision | Owner |

**Inspections**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/inspections` | List inspections | All members |
| POST | `/projects/:id/inspections` | Add custom inspection | Owner |
| PATCH | `/projects/:id/inspections/:insId` | Update status/result | Owner, Collaborator |

**Site Diary**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/diary` | List diary entries (paginated) | All members |
| GET | `/projects/:id/diary/:date` | Get entry for specific date | All members |
| POST | `/projects/:id/diary` | Create diary entry | Owner, Collaborator |
| PATCH | `/projects/:id/diary/:date` | Update diary entry | Owner, Collaborator |

**Photos**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/photos` | List photos (filterable by room, phase, type) | All members |
| POST | `/projects/:id/photos` | Upload photo (multipart) | Owner, Collaborator |
| PATCH | `/projects/:id/photos/:photoId` | Update tags/metadata | Owner, Collaborator |
| DELETE | `/projects/:id/photos/:photoId` | Delete photo | Owner |

**Snags**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/snags` | List snags (filterable) | All members |
| POST | `/projects/:id/snags` | Create snag | Owner, Collaborator |
| PATCH | `/projects/:id/snags/:snagId` | Update snag | Owner, Collaborator |
| GET | `/share/:token` | Public contractor snag list (no auth) | Public |

**Alerts & Activity**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/alerts` | Computed alerts across all modules | All members (filtered by role) |
| GET | `/projects/:id/activity` | Activity feed (paginated) | All members |

**Export**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/projects/:id/export/:module` | CSV or PDF export | Owner |

**Auth & Invites**
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/auth/me` | Get current user + project role | Authenticated |
| POST | `/auth/invite` | Send collaborator invite | Owner |
| POST | `/auth/accept-invite` | Accept invite | Authenticated |

---

## Database Schema

All tables live in PostgreSQL on Supabase. Schema is defined once in `packages/db/src/schema.ts` using Drizzle ORM, shared by both the API and (if needed) the web app.

Drizzle generates and manages migrations in `packages/db/drizzle/migrations/`.

```sql
-- Auth is handled by Supabase Auth (auth.users table)
-- Our tables reference auth.users via user_id

CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  local_authority TEXT NOT NULL DEFAULT 'London Borough of Barnet',
  total_budget    INTEGER,              -- in pence
  contingency_pct INTEGER DEFAULT 15,
  start_date      DATE,
  target_completion DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'collaborator', 'viewer')),
  modules     TEXT[],                   -- accessible modules (null = all for owners)
  invited_at  TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE (project_id, user_id)
);

CREATE TABLE phases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'not_started'
              CHECK (status IN ('not_started', 'in_progress', 'done')),
  start_date  DATE,
  end_date    DATE
);

CREATE TABLE tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id            UUID REFERENCES phases(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  status              TEXT NOT NULL DEFAULT 'not_started'
                      CHECK (status IN ('not_started', 'in_progress', 'blocked', 'done')),
  assignee_id         UUID REFERENCES auth.users(id),
  start_date          DATE,
  due_date            DATE,
  actual_start        DATE,
  actual_end          DATE,
  is_milestone        BOOLEAN DEFAULT false,
  inspection_required BOOLEAN DEFAULT false,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE task_dependencies (
  task_id       UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on_id)
);

CREATE TABLE budget_categories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID REFERENCES projects(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  allocated_amount INTEGER,             -- in pence
  typical_pct      NUMERIC(5,2),
  sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE budget_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('quote', 'invoice', 'payment')),
  supplier        TEXT,
  description     TEXT,
  amount          INTEGER NOT NULL,     -- in pence
  vat_amount      INTEGER DEFAULT 0,    -- in pence
  date            DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'rejected', 'paid', 'partially_paid')),
  receipt_path    TEXT,
  linked_quote_id UUID REFERENCES budget_entries(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vat_entries (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id                UUID REFERENCES projects(id) ON DELETE CASCADE,
  budget_entry_id           UUID REFERENCES budget_entries(id),
  invoice_number            TEXT,
  supplier_name             TEXT NOT NULL,
  supplier_vat_number       TEXT,
  description               TEXT NOT NULL,
  net_amount                INTEGER NOT NULL,   -- in pence
  vat_amount                INTEGER NOT NULL,   -- in pence
  invoice_total             INTEGER NOT NULL,   -- in pence
  invoice_date              DATE NOT NULL,
  source                    TEXT NOT NULL
                            CHECK (source IN ('direct_purchase', 'contractor_zero_rated', 'contractor_vat_error')),
  reclaimable               TEXT NOT NULL DEFAULT 'needs_review'
                            CHECK (reclaimable IN ('yes', 'no', 'needs_review')),
  has_claimant_name_address BOOLEAN,
  receipt_path              TEXT,
  validated                 BOOLEAN DEFAULT false,
  notes                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE planning_conditions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID REFERENCES projects(id) ON DELETE CASCADE,
  condition_number INTEGER NOT NULL,
  description      TEXT NOT NULL,
  condition_type   TEXT NOT NULL
                   CHECK (condition_type IN ('pre_commencement', 'pre_occupation', 'ongoing', 'informative')),
  status           TEXT NOT NULL DEFAULT 'not_started'
                   CHECK (status IN ('not_started', 'submitted', 'discharged', 'partially_discharged')),
  submission_date  DATE,
  decision_date    DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cil_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  step_number    INTEGER NOT NULL,
  form_name      TEXT NOT NULL,
  description    TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'not_started'
                 CHECK (status IN ('not_started', 'submitted', 'confirmed', 'overdue')),
  submitted_date DATE,
  confirmed_date DATE,
  deadline       DATE,
  is_blocking    BOOLEAN DEFAULT false,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  folder      TEXT NOT NULL,
  name        TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  file_size   INTEGER,
  mime_type   TEXT,
  tags        TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  version     INTEGER DEFAULT 1
);

CREATE TABLE contacts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID REFERENCES projects(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  role             TEXT,
  company          TEXT,
  phone            TEXT,
  email            TEXT,
  address          TEXT,
  website          TEXT,
  notes            TEXT,
  insurance_expiry DATE,
  qualifications   TEXT,
  contract_value   INTEGER,             -- in pence; owner-only visibility
  rating           INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_pinned        BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE decisions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  category       TEXT,
  status         TEXT NOT NULL DEFAULT 'not_started'
                 CHECK (status IN ('not_started', 'researching', 'shortlisted', 'decided', 'ordered')),
  deadline       DATE,
  lead_time_days INTEGER,
  order_by_date  DATE,
  decided_date   DATE,
  decided_by     UUID REFERENCES auth.users(id),
  linked_task_id UUID REFERENCES tasks(id),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE decision_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  supplier    TEXT,
  cost        INTEGER,
  pros        TEXT,
  cons        TEXT,
  is_chosen   BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE inspections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('building_control', 'warranty', 'other')),
  linked_task_id UUID REFERENCES tasks(id),
  status         TEXT NOT NULL DEFAULT 'not_needed'
                 CHECK (status IN ('not_needed', 'due', 'booked', 'passed', 'conditional', 'failed')),
  scheduled_date DATE,
  result_notes   TEXT,
  inspector      TEXT,
  is_custom      BOOLEAN DEFAULT false,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE diary_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         UUID REFERENCES projects(id) ON DELETE CASCADE,
  entry_date         DATE NOT NULL,
  weather_temp       TEXT,
  weather_conditions TEXT,
  weather_wind       TEXT,
  workers_on_site    TEXT[],
  work_completed     TEXT,
  issues             TEXT,
  deliveries         TEXT,
  visitors           TEXT,
  health_safety      TEXT,
  notes              TEXT,
  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, entry_date)
);

CREATE TABLE photos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  diary_entry_id UUID REFERENCES diary_entries(id),
  file_path      TEXT NOT NULL,
  thumbnail_path TEXT,
  taken_at       TIMESTAMPTZ DEFAULT now(),
  room           TEXT,
  phase          TEXT,
  trade          TEXT,
  photo_type     TEXT CHECK (photo_type IN ('progress', 'concealed', 'issue', 'delivery', 'inspection', 'snag')),
  tags           TEXT[],
  uploaded_by    UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE snags (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID REFERENCES projects(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  room                 TEXT,
  category             TEXT CHECK (category IN ('structural', 'cosmetic', 'functional', 'safety')),
  severity             TEXT CHECK (severity IN ('critical', 'major', 'minor')),
  description          TEXT,
  photo_ids            UUID[],
  responsible_contact  UUID REFERENCES contacts(id),
  date_found           DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline             DATE,
  status               TEXT NOT NULL DEFAULT 'open'
                       CHECK (status IN ('open', 'assigned', 'in_progress', 'fixed', 'verified')),
  resolution_photo_ids UUID[],
  resolution_date      DATE,
  resolution_notes     TEXT,
  verified_by          UUID REFERENCES auth.users(id),
  share_token          TEXT UNIQUE,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  module      TEXT NOT NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  summary     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS)

Supabase RLS policies enforce access at the database level as a safety net. The API's `project-access` middleware is the primary access control; RLS is defence-in-depth.

```sql
-- Users can only see projects they're a member of
CREATE POLICY "Members can read project" ON projects
  FOR SELECT USING (
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

-- Only owners can see budget data
CREATE POLICY "Owners can read budget" ON budget_entries
  FOR SELECT USING (
    category_id IN (
      SELECT bc.id FROM budget_categories bc
      JOIN project_members pm ON pm.project_id = bc.project_id
      WHERE pm.user_id = auth.uid() AND pm.role = 'owner'
    )
  );

-- Collaborators can update tasks assigned to them
CREATE POLICY "Assignees can update tasks" ON tasks
  FOR UPDATE USING (assignee_id = auth.uid());
```

---

## Auth Flow

```
Browser → SvelteKit login page → Supabase Auth (JWT issued)
  → hooks.server.ts validates session on every request
  → +layout.server.ts calls API /auth/me to get user role + project
  → Pages render with role-appropriate data and UI
```

**Collaborator invite:**
1. Owner enters email + role + modules in settings page
2. SvelteKit form action calls `POST /auth/invite`
3. API creates `project_members` row, sends magic link email via Resend
4. Collaborator clicks link → Supabase creates account → redirect to `/auth/invite/[token]`
5. API sets `accepted_at` on `project_members`
6. Collaborator sees only permitted modules

---

## Scheduled Jobs (apps/api)

The API runs as a persistent process on Railway, enabling cron jobs via `node-cron`:

| Job | Schedule | What It Does |
|-----|----------|-------------|
| `daily-alerts` | 8:00 AM daily | Sends email digest to owners: overdue tasks, inspections due, decisions approaching deadline, budget warnings |
| `deadline-reminders` | 9:00 AM daily | Specific high-stakes deadline warnings: VAT reclaim (30/14/7 days), CIL Form 7 Part 2, insurance expiry, planning condition deadlines |
| `cleanup` | 2:00 AM weekly | Prune activity_log entries older than 12 months, remove orphaned storage files |

```typescript
// apps/api/src/jobs/scheduler.ts
import cron from 'node-cron';
import { runDailyAlerts } from './daily-alerts';
import { runDeadlineReminders } from './deadline-reminders';
import { runCleanup } from './cleanup';

export function startScheduler() {
  cron.schedule('0 8 * * *', runDailyAlerts);      // 8 AM daily
  cron.schedule('0 9 * * *', runDeadlineReminders); // 9 AM daily
  cron.schedule('0 2 * * 1', runCleanup);           // 2 AM Monday
}
```

---

## File Storage

All files stored in Supabase Storage:

```
buildboard/
└── {project_id}/
    ├── documents/{folder}/{filename}
    ├── photos/{yyyy-mm-dd}/{uuid}.{ext}
    ├── photos/thumbnails/{uuid}.webp
    └── receipts/{vat_entry_id}/{filename}
```

**Upload flow:**
1. Frontend sends file to SvelteKit form action
2. SvelteKit forwards to `POST /projects/:id/documents` or `/photos` (multipart)
3. API validates auth, file type (allowlist), file size (20MB docs, 10MB photos)
4. API uploads to Supabase Storage
5. For photos: generates 400px-wide WebP thumbnail using Sharp, uploads to `thumbnails/`
6. API creates DB record with storage paths
7. Returns signed URL for display

---

## Key Business Logic (services/)

### VAT Classification (vat.service.ts)

```typescript
import { vatRules } from '@buildtracker/shared';

export function classifyVATEntry(entry: NewVATEntry): VATClassification {
  // Auto-classify based on description keywords
  const category = vatRules.classify(entry.description);

  // Flag validation issues
  const flags: string[] = [];

  if (entry.invoice_total > 25000 && !entry.has_claimant_name_address) {
    flags.push('Invoice over £250 must show claimant name and site address');
  }

  if (entry.source === 'contractor_vat_error') {
    flags.push('Contractor incorrectly charged VAT — get invoice corrected before paying');
  }

  if (category === 'needs_review') {
    flags.push('Item may or may not be reclaimable — check HMRC guidance or consult accountant');
  }

  return { reclaimable: category, flags };
}
```

### CIL Enforcement (cil.service.ts)

```typescript
export function canCommence(projectId: string): { allowed: boolean; reason?: string } {
  const steps = getCILSteps(projectId);

  const exemption = steps.find(s => s.form_name === 'Form 7 Part 1');
  if (!exemption || exemption.status !== 'confirmed') {
    return { allowed: false, reason: 'CIL self-build exemption not yet confirmed by Barnet' };
  }

  const commencement = steps.find(s => s.form_name === 'Form 6');
  if (!commencement || commencement.status !== 'confirmed') {
    return { allowed: false, reason: 'CIL Commencement Notice not yet acknowledged' };
  }

  return { allowed: true };
}
```

### Inspection Triggers (tasks.service.ts)

```typescript
export function completeTask(taskId: string): TaskUpdateResult {
  const task = getTask(taskId);

  // Check CIL blocking for Phase B+ tasks
  if (isConstructionPhaseTask(task)) {
    const cil = canCommence(task.projectId);
    if (!cil.allowed) return { blocked: true, reason: cil.reason };
  }

  // Update task
  updateTaskStatus(taskId, 'done');

  // Trigger inspection if needed
  if (task.inspection_required) {
    const inspection = getLinkedInspection(taskId);
    updateInspectionStatus(inspection.id, 'due');
    return {
      blocked: false,
      warning: `Book ${inspection.name} before proceeding. Barnet BC: call before 10am for same-day inspection.`,
    };
  }

  logActivity(task.projectId, 'tasks', 'completed', taskId);
  return { blocked: false };
}
```

---

## Deployment

```
                    ┌──────────────┐     ┌──────────────────┐
                    │   Vercel     │     │    Railway        │
                    │  (SvelteKit) │────►│   (Hono API)     │
                    │  apps/web    │     │   apps/api        │
                    └──────────────┘     │   + cron jobs     │
                                         └────────┬─────────┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    │              │              │
                                    ▼              ▼              ▼
                             ┌──────────┐  ┌────────────┐  ┌─────────┐
                             │ Supabase │  │  Supabase  │  │ Resend  │
                             │ Postgres │  │  Storage   │  │ (email) │
                             └──────────┘  └────────────┘  └─────────┘
```

**Environments:**
- `main` branch → production
- Pull requests → Vercel preview deploys (frontend) + Railway staging (API)
- Local dev: `pnpm dev` runs both SvelteKit and Hono concurrently with local Supabase

**Environment variables (apps/web):**
```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
API_URL=                             # Railway URL for the Hono API
```

**Environment variables (apps/api):**
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
DATABASE_URL=                        # Direct Postgres connection string
RESEND_API_KEY=
CORS_ORIGIN=                         # Vercel frontend URL (only needed if API is ever called from browser)
PORT=3001
```

**Railway Dockerfile (apps/api):**
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @buildtracker/api build
EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]
```

---

## Testing Strategy

| Type | Tool | What | Where |
|------|------|------|-------|
| Unit | Vitest | VAT rules, CIL validation, date/currency utils | packages/shared |
| Unit | Vitest | Service functions (alerts, budget calc, task completion) | apps/api |
| Integration | Vitest + Supabase local | API routes with real DB | apps/api |
| Component | Vitest + @testing-library/svelte | Key UI components | apps/web |
| E2E | Playwright | Full user flows: login → add task → log invoice → export VAT | Root |

**MVP priority:** Unit tests for `packages/shared` (VAT rules, CIL rules — legal/financial consequences if wrong). Integration tests for critical API flows (task completion with inspection trigger, CIL blocking, budget entry with auto VAT classification).

---

## Performance

- **SSR** — dashboard and list views render on server. No loading spinners.
- **Photo thumbnails** — 400px WebP thumbnails in galleries; full resolution on tap.
- **Pagination** — diary, budget entries, activity log paginate at 50 items.
- **Lazy loading** — photo galleries use intersection observer.
- **Connection pooling** — API uses Supabase's pgBouncer for Postgres connections.
- **API response caching** — seed data (phases template, budget categories) cached in memory on API startup.

---

## Security

- **RLS as safety net** — even if API code has a bug, Supabase RLS prevents cross-project data leaks.
- **Server-only secrets** — service role key and Resend key exist only in API environment.
- **Auth middleware** — every API request verified via Supabase JWT before any data access.
- **Role middleware** — project membership and role checked on every request.
- **File validation** — allowlist of file types (PDF, PNG, JPG, WEBP, HEIC, DOC, DOCX, XLS, XLSX), size limits enforced server-side.
- **Signed URLs** — storage files accessed via time-limited URLs, not public.
- **Parameterised queries** — Drizzle ORM prevents SQL injection.
- **CSRF** — SvelteKit form actions include built-in CSRF protection.
- **Share tokens** — snag list share links use cryptographic random tokens, not sequential IDs.
- **No secrets in frontend** — `PUBLIC_` prefixed env vars only contain non-sensitive Supabase URL and anon key.
