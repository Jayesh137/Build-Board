# BuildBoard - Product Requirements Document

## Overview

BuildBoard is a web application for first-time self-builders managing a UK house build from planning permission through to move-in. It replaces the patchwork of spreadsheets, WhatsApp messages, paper checklists, and filing cabinets that most self-builders currently rely on.

**Core philosophy:** You should never have to wonder "what should I be doing next?"

### Project Context

- **Property:** 3-storey detached house, ~184 sqm GIA (ground floor open-plan living, first floor 2 bedrooms + bathroom/sauna, loft office/gym + en-suite)
- **Location:** Grange View Road, Whetstone, London N20 9EP
- **Local Authority:** London Borough of Barnet
- **Architect:** A3D
- **Status:** Planning permission pending approval (as of March 2026)
- **Users:** Property owners (no prior construction experience) + invited collaborators (architect, builder, building control etc.)

---

## Scope: MVP vs Post-MVP

### MVP (Build First)

| Module | Notes |
|--------|-------|
| Dashboard | Project vitals, alerts, next actions |
| Timeline & Phases | Pre-loaded template, list view, task dependencies, milestone tracking |
| Budget & Finances | Categories, invoice/payment logging, budget vs actuals |
| VAT Reclaim Tracker | Invoice logging, categorisation, deadline countdown, HMRC export |
| Planning / CIL / Conditions Tracker | Condition tracking, CIL form workflow, planning status |
| Documents Vault | Upload, organise, tag, search, required-documents checklist |
| Contacts Directory | Contact cards with role, insurance expiry, qualifications |
| Decisions Log | Decision tracking with deadlines, options, lead times |
| Inspections Tracker | Configurable inspections, auto-prompts from timeline, result tracking |
| Site Diary & Photos | Daily log, photo upload with tagging, concealed works prompts |
| Snag List | Defect tracking with photos, contractor assignment, resolution flow |

### Post-MVP (Build Later)

| Feature | Why Deferred |
|---------|-------------|
| Gantt chart visualisation | Use list/board views first; Gantt is complex to build well |
| Critical path highlighting | Requires full dependency graph engine |
| Weather API integration | Manual weather logging in site diary is sufficient for MVP |
| Weather schedule overlay & smart alerts | Depends on weather API |
| Warranty & Maintenance module | Only needed post-completion |
| Procurement / Purchase Orders | Can use budget module + decisions log initially |
| Variations / Change Orders / Retentions | Can track in budget module initially |
| Funding / Cashflow / Stage Drawdowns | Can use budget module with notes initially |
| Meetings / Actions / RFI Tracker | Can use site diary + decisions log initially |
| Room Data Sheets / Finish Schedules | Can use decisions log + documents vault initially |
| Handover Pack generator | Only needed post-completion |
| Offline mode | Build for good mobile signal first |
| AI-powered receipt OCR | Manual entry is fine for MVP |
| Before/after photo slider | Nice-to-have visualisation |
| Voice-to-text notes | Browser support is patchy |
| Multi-user real-time collaboration | Start with refresh-based updates |

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | SvelteKit (Svelte 5 + Vite) | SSR, file-based routing, form actions. Fast page loads, works well on phones. |
| **Backend API** | Hono (Node.js) | TypeScript-first REST API. All business logic, data access, file processing, scheduled jobs. |
| **Language** | TypeScript (everywhere) | One language across frontend, API, and shared packages |
| **Styling** | Tailwind CSS 4 | Utility-first, responsive by default, fast to build with |
| **Charts** | Layerchart (Svelte-native, D3-based) | Svelte-first charting for budget visualisations |
| **Database** | PostgreSQL via Supabase | Multi-user, concurrent writes, Row Level Security, free tier |
| **ORM** | Drizzle ORM | Type-safe queries, shared schema between frontend and API |
| **File Storage** | Supabase Storage | Documents and photos, signed URLs, integrated with auth |
| **Auth** | Supabase Auth (via @supabase/ssr) | Email/password + magic links for invites, JWT-based |
| **Image Processing** | Sharp | Photo thumbnail generation on upload |
| **Scheduled Jobs** | node-cron (in API) | Daily alert emails, deadline reminders, insurance expiry warnings |
| **Email** | Resend (free tier) | Transactional emails for invites, alerts, reminders |
| **Validation** | Zod | Shared request/response schemas between frontend and API |
| **Monorepo** | pnpm workspaces + Turborepo | Single repo, shared packages, parallel builds |
| **Frontend Deploy** | Vercel | Free tier, HTTPS, preview deploys |
| **API Deploy** | Railway | Persistent process for cron jobs, longer timeouts, ~$5/mo |

**Architecture:** Monorepo with SvelteKit frontend + Hono API backend + shared packages. SvelteKit handles rendering and user interaction. All data access goes through the Hono API (server-to-server, never from browser). The API owns all business logic, validation, and scheduled jobs. See `ARCHITECTURE.md` for full technical details.

---

## User Roles & Access Control

| Role | Access | Example Users |
|------|--------|---------------|
| **Owner** | Full access to all modules, settings, budget, user management | Jayesh, wife |
| **Collaborator** | Can view timeline, update assigned tasks, upload documents, add photos, update snags. CANNOT see budget/finances or VAT reclaim | Builder, architect, project manager |
| **Viewer** | Read-only access to shared views (timeline, documents) | Building control officer, warranty inspector |

- Owners can invite users via email link
- Owners control which modules each collaborator can access
- All user actions are logged in the activity feed

---

## Module 1: Dashboard

The command centre. One screen that answers "where are we?" without clicking anything.

### Layout

**Top Strip - Project Vitals:**
- Current build phase label (e.g. "Pre-Construction — Awaiting Planning Approval")
- Days into project / estimated days remaining
- Overall progress bar (calculated from completed tasks vs total)

**Left Column - Timeline Snapshot:**
- Next 3 upcoming milestones with countdown days
- Overdue tasks highlighted in red with days overdue
- This week's tasks at a glance
- Next inspection due (building control or warranty)

**Centre Column - Budget Summary:**
- Total budget vs spent vs committed (quotes accepted but not yet paid)
- Visual bar chart: budget / spent / committed / remaining
- Contingency fund remaining with colour coding:
  - Green: >10% remaining
  - Amber: 5-10% remaining
  - Red: <5% remaining
- VAT reclaim running total
- Spend this month vs last month

**Right Column - Activity & Alerts:**
- Recent activity feed (documents uploaded, decisions made, photos added, task updates)
- Smart alerts system:
  - Lead time warnings (e.g. "Order kitchen by April 15 to meet schedule")
  - Inspection reminders (e.g. "Building control inspection needed before plastering")
  - Insurance/certification expiry warnings
  - Decision deadline reminders
  - VAT reclaim deadline countdown
  - CIL form deadlines
  - Planning condition discharge deadlines
- Upcoming decisions that need making with deadlines

**Bottom Strip - Quick Stats:**
- Open snags count
- Pending decisions count
- Documents awaiting action
- Undischarged planning conditions count

**Behaviour:**
- Every element is clickable and navigates to the relevant module
- Dashboard auto-refreshes on load
- Smart alerts are prioritised by urgency (overdue > due today > upcoming)

---

## Module 2: Timeline & Phases

The backbone of the app. Pre-loaded with every stage of a UK self-build, with dependencies and inspection triggers.

### Pre-Built Phase Template

The app ships with a complete UK self-build timeline template. Users can adjust durations, add/remove tasks, and reorder. The structure, dependencies, and inspection triggers are pre-configured but fully editable.

#### Phase A: Pre-Construction (6-12 months)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Submit planning application | — | — |
| Planning decision received | Submit planning application | **Milestone: PLANNING APPROVED** |
| Identify pre-commencement conditions | Planning decision received | Each condition becomes a trackable item in Planning module |
| Discharge pre-commencement conditions | Identify conditions | Each condition tracked separately; all must be discharged before commencement |
| Submit building regulations (full plans) | Planning approved | — |
| Building regulations approved | Submit building regs | — |
| CIL: Submit Form 2 (Assumption of Liability) | Planning approved | — |
| CIL: Receive Liability Notice | Form 2 submitted | Issued by Barnet within ~1 month of planning approval |
| CIL: Submit Form 7 Part 1 (Self-Build Exemption Claim) | Liability Notice received | — |
| CIL: Receive exemption confirmation in writing | Form 7 Part 1 submitted | **BLOCKING: Do NOT commence any work until confirmed** |
| CIL: Submit Form 6 (Commencement Notice) | Exemption confirmed | Must be acknowledged by Barnet before starting. Failure = surcharge up to £2,500 |
| Serve Party Wall notices (if applicable) | Planning approved | 1-3 month lead time |
| Party Wall Award received | Serve notices | — |
| Arrange structural warranty | Building regs approved | Must be before construction starts; provider needs to inspect throughout |
| Arrange site insurance | — | Must be from day one on site |
| Apply for water connection | Planning approved | 3-6 month lead time |
| Apply for electricity connection (DNO) | Planning approved | 3-6 month lead time |
| Apply for gas connection | Planning approved | — |
| Apply for dropped kerb / vehicle crossover (if needed) | Planning approved | Apply via Barnet; 3-6 month lead time |
| Apply for scaffold/hoarding licence (if near highway) | Before site setup | Barnet highways licence required |
| Appoint builder / main contractor | Building regs approved | Get minimum 3 quotes |
| Sign building contract | Appoint builder | Use JCT or similar |
| Appoint Principal Designer (CDM) | Sign contract | Required if more than one contractor; defaults to lead designer if not formally appointed |
| Appoint Principal Contractor (CDM) | Sign contract | Required if more than one contractor; defaults to main contractor if not formally appointed |
| Prepare Construction Phase Plan (CDM) | Appoint PC | Required before construction begins on every project |
| Submit F10 to HSE (if notifiable) | Construction Phase Plan | Required if: >30 working days AND >20 workers at any point, OR >500 person-days total |
| Agree construction programme | Sign contract | — |
| Apply for street naming & numbering | Planning approved | Apply to Barnet; allow 5-6 weeks minimum, apply 3+ months before occupation |
| Notify building control of commencement | All above complete | Minimum 2 working days before start |
| Notify warranty provider of start date | Arrange warranty | — |

#### Phase B: Site Preparation & Groundworks (2-4 weeks)

**Commencement warning:** Starting any material operation on site (including demolition or site clearance that forms part of the planning permission) constitutes "commencement" for CIL purposes. All CIL forms must be confirmed before this phase begins.

| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Site clearance / demolition | Phase A complete, CIL commencement confirmed | Demolition = commencement for CIL. Ensure all pre-commencement planning conditions are discharged. |
| Erect site hoarding/fencing | Site clearance | Highways licence if encroaching on pavement |
| Set up temporary facilities (WC, water, electric) | Site clearance | — |
| Setting out (surveyor marks building lines) | Site clearance | — |
| Topsoil strip and storage | Setting out | — |
| Excavation for foundations | Setting out | Inspection: Excavation (before concrete) |
| Below-ground drainage runs | Excavation | Inspection: Drainage (before backfill) |

#### Phase C: Foundations (2-3 weeks)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Pour foundation concrete | Excavation inspection passed | Inspection: Foundation concrete |
| Blockwork substructure walls (to DPC) | Foundation concrete | Inspection: DPC |
| Below-ground service entry points | Substructure walls | — |
| Backfill around foundations | DPC inspection passed | — |
| Hardcore, DPM, insulation for slab | Backfill complete | Inspection: Oversite preparation |
| Pour ground floor slab | Oversite inspection passed | — |

#### Phase D: Superstructure (6-10 weeks)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| External walls — ground floor | Ground floor slab | — |
| First floor structure (joists/beams) | Ground floor walls | Inspection: Floor structure |
| Structural steelwork | As needed | Inspection: Steelwork (before covering) |
| External walls — first floor | First floor structure | — |
| Second floor structure | First floor walls | Inspection: Floor structure |
| External walls — loft level | Second floor structure | — |
| Window and external door installation | Walls complete | — |
| Scaffold erection and adjustments | Ongoing | — |

#### Phase E: Roof (3-5 weeks)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Roof structure (trusses/rafters) | Loft walls complete | Inspection: Roof structure |
| Breathable membrane and battens | Roof structure | — |
| Roof covering (tiles/slates) | Membrane and battens | — |
| Lead flashings, valleys, ridges | Roof covering | — |
| Velux/roof windows | Roof covering | — |
| Fascias, soffits, guttering | Roof covering | — |
| — | All above | **Milestone: WEATHERTIGHT** |

#### Phase F: First Fix (4-8 weeks)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Carpentry first fix (stud walls, door linings, noggins) | Weathertight | — |
| Electrical first fix (cable runs, back boxes, consumer unit position) | Weathertight | — |
| Plumbing first fix (pipework, waste, soil stacks) | Weathertight | — |
| Heating first fix (UFH loops or radiator pipework, boiler flue prep) | Weathertight | — |
| MVHR ductwork (if applicable) | Weathertight | — |
| Insulation (walls, floors, loft) | All first fix services complete | — |
| Fire stopping and cavity barriers | Insulation complete | — |
| Staircase installation | Carpentry first fix | — |
| — | All above | **Inspection: Pre-plaster (KEY — all services, insulation, fire stopping must be visible)** |
| — | All above | Warranty: Pre-plaster inspection |

#### Phase G: Plastering & Drying (3-6 weeks)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Plasterboard fixing | Pre-plaster inspection passed | — |
| Skim coat plastering | Plasterboard | — |
| Floor screed | Plasterboard | — |
| Drying out period | Plaster and screed complete | Min 2-4 weeks; monitor moisture levels. Do not rush. |

#### Phase H: Second Fix & Finishes (4-8 weeks)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Carpentry second fix (doors, skirting, architraves, window boards) | Plaster dry | — |
| Electrical second fix (faceplates, lights, consumer unit, testing) | Plaster dry | Part P certificate required |
| Plumbing second fix (sanitaryware, taps, showers) | Plaster dry | — |
| Boiler installation and commissioning | Plumbing second fix | Gas Safe certificate required |
| Unvented hot water cylinder | Plumbing second fix | G3 commissioning certificate |
| Kitchen installation | Carpentry + plumbing second fix | — |
| Bathroom tiling | Plumbing second fix | — |
| Decoration (mist coat, paint, wallpaper) | All second fix | — |
| Flooring (carpet, wood, tiles, LVT) | Decoration complete | — |
| Fitted wardrobes / built-in storage | Decoration complete | — |
| EV charger installation | Electrical second fix | Part S compliance |

#### Phase I: External Works (2-6 weeks, overlaps with Phase H)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Driveway construction | Scaffold removed | — |
| Pathways and patios | External walls complete | — |
| Fencing and boundary treatments | — | — |
| Landscaping, turfing, planting | — | May be a planning condition with deadline |
| External lighting | Electrical second fix | — |
| Final drainage (soakaways, connections, manholes to level) | — | Inspection: Final drain test |
| Scaffold removal | External walls and roof complete | — |
| Site clearance and final clean | All external works | — |

#### Phase J: Testing & Sign-Off (2-4 weeks)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Air tightness test | Building substantially complete | Must achieve ≤10 m³/(h·m²) |
| As-built SAP calculation | Air test result | — |
| EPC (Energy Performance Certificate) | SAP calculation | Legal requirement before occupation |
| Electrical Installation Certificate | Electrical second fix complete | Part P |
| Gas Safety Certificate | Boiler commissioned | Gas Safe |
| Unvented hot water certificate | Cylinder commissioned | G3 |
| FENSA window certificate | Windows installed | Or building control inspects directly |
| Compile all certificates for building control | All above | — |
| Building control final inspection | All certificates + external works | 5 working days notice |
| **Completion Certificate issued** | Final inspection passed | **Milestone: BUILDING COMPLETE** |
| Warranty provider final inspection | Completion certificate | — |
| **10-year structural warranty issued** | Warranty inspection passed | Register within 28 days |

#### Phase K: Completion Admin & Move-In (1-4 weeks)
| Task | Dependencies | Trigger/Note |
|------|-------------|-------------|
| Full snagging walkthrough (room by room) | Completion certificate | Use Snag List module |
| Contractor rectification of snags | Snagging walkthrough | — |
| Verify all snags resolved | Contractor rectification | Before/after photos |
| Register for council tax with Barnet | Completion certificate | Email inspectors@barnet.gov.uk; expect Completion Notice |
| Confirm street address with Royal Mail | Street naming complete | Activate postcode |
| Update Land Registry | Completion certificate | Via solicitor |
| Submit VAT reclaim to HMRC | Completion certificate | **Deadline: 6 months from completion certificate date** |
| Submit CIL Form 7 Part 2 | Completion certificate | **Deadline: 6 months from completion. Provide proof of occupation.** |
| Connect all utilities to permanent supply | Before move in | — |
| Cancel site insurance | Move in | — |
| Arrange buildings and contents insurance | Before move in | Note structural warranty |
| Set up CIL 3-year occupancy tracking | Move in | Must occupy as sole/main residence for 3 years or exemption is clawed back |
| **Move in!** | All above | **Milestone: MOVE IN** |

### Timeline Features (MVP)
- **List view** with task status, dates, assignee, and phase grouping
- **Board view** (kanban-style: Not Started / In Progress / Blocked / Done)
- **Dependencies** — tasks show warnings when predecessors are incomplete
- **Milestone markers** — visually prominent on the timeline
- **Assignee** — assign tasks to yourself, your wife, or collaborators
- **Notes per task** — add context, links, or comments
- **Filter by phase, status, assignee**
- **Inspection triggers** — flagged with a warning icon; prompt to book inspection before proceeding

### Timeline Features (Post-MVP)
- Gantt chart view with colour-coded phases and progress overlay
- Critical path highlighting
- Drag to adjust dates with automatic dependent task recalculation
- Weather risk overlay on outdoor tasks

---

## Module 3: Budget & Finances

Track every penny from first architect invoice to final landscaping bill.

### Budget Structure

Pre-loaded UK self-build cost categories with typical percentage allocations as guidance:

| Category | Typical % | Sub-categories |
|----------|-----------|---------------|
| **Professional Fees** | 10-15% | Architect, structural engineer, quantity surveyor, planning consultant, project manager, party wall surveyor, ecological surveys, topographical survey, soil survey |
| **Statutory & Regulatory** | 2-3% | Planning application, building control fees, CIL (if applicable), SAP calculation, air testing, CDM costs |
| **Groundworks & Foundations** | 10-15% | Site clearance, excavation, foundations, below-ground drainage, ground floor slab |
| **Superstructure** | 25-35% | External walls, internal walls, floor structures, steelwork, windows, external doors |
| **Roof** | 8-12% | Roof structure, coverings, flashings, Velux windows, fascias/soffits/guttering |
| **First Fix** | 15-20% | Electrical, plumbing, heating, carpentry, insulation, MVHR |
| **Plastering & Screeding** | 3-5% | Plasterboard, skim, floor screed |
| **Second Fix & Finishes** | 20-30% | Electrical, plumbing, carpentry, kitchen, bathrooms, tiling, decoration, flooring, fitted storage |
| **External Works** | 8-12% | Driveway, landscaping, fencing, patio, external lighting, drainage |
| **Utilities & Connections** | 3-5% | Water, electricity, gas, sewer, broadband/telecoms, dropped kerb |
| **Insurance & Warranty** | 1-2% | Site insurance, structural warranty |
| **Site Costs** | 2-4% | Scaffolding, skip hire, temporary facilities, site security, storage, highways licences |
| **Contingency** | 15% | Recommended minimum for first-time self-build |

### Features

**Budget Setup:**
- Set total project budget
- Allocate across categories (guided by typical percentages)
- Set contingency percentage (default 15%, recommended minimum)
- North London benchmark costs shown for reference (~£2,800-£3,200/m² for medium-high spec)

**Tracking:**
- **Quotes** — log quotes received per category, compare side-by-side, mark as accepted/rejected
- **Invoices** — log every invoice with: date, supplier, amount, category, description, payment status, VAT amount
- **Payments** — record payments made against invoices, partial payments supported
- **Committed costs** — quotes accepted but not yet invoiced show as committed
- **Actual vs budget** — real-time comparison per category and overall

**Visualisations:**
- Budget vs spent vs committed bar chart (per category)
- Overall spend pie chart by category
- Contingency burn-down chart
- Monthly spend trend
- Category variance (over/under budget per category)

**Smart Features:**
- Alert when any category exceeds budget by >10%
- Alert when contingency drops below 10%, 5%
- Running total updates on dashboard
- Export to CSV/Excel for accountant
- Receipt/invoice photo upload linked to each entry

---

## Module 4: VAT Reclaim Tracker

A dedicated module because this is worth tens of thousands of pounds and you only get one shot.

### How It Works

Under HMRC VAT Notice 431NB, self-builders of a new dwelling can submit **ONE claim** to reclaim VAT paid on eligible building materials they purchased directly.

**Deadline rules:**
- For new builds completed **on or after 5 December 2023**: claim must be submitted within **6 months** of the building control completion certificate date
- For new builds completed **before 5 December 2023**: claim must be submitted within **3 months**

**Invoice requirements:**
- Invoices with a total value **over £250** must show the claimant's name and site address (not the builder's name/address)
- Invoices £250 or under do not need the claimant's name but must still show supplier VAT number, date, description, and VAT amount

### What Can and Cannot Be Reclaimed

The VAT reclaim applies to **building materials that you (the self-builder) purchase directly and that are incorporated into the building**. It does not apply to contractor invoices for labour+materials on new builds, because those should already be zero-rated (0% VAT).

#### Goods Purchased Directly by You (the self-builder)

**Definitely reclaimable (standard-rated goods you buy and incorporate into the building):**
- Bricks, blocks, concrete, cement, morite, sand, aggregates
- Timber (structural and finishing)
- Roof tiles, slates, lead
- Windows and external doors
- Internal doors and frames
- Kitchen units and fitted worktops
- Sanitaryware (baths, WCs, basins, shower trays)
- Taps, shower valves, shower enclosures
- Boiler, radiators, underfloor heating components
- Heat pump units
- Electrical fittings (sockets, switches, consumer unit, light fittings that are wired in)
- Insulation materials
- Plaster, plasterboard, render
- Floor tiles, engineered wood flooring, stone flooring
- Paint, sealants, adhesives
- Guttering, fascias, soffits
- DPM, breathable membrane
- Staircase components
- Ironmongery (hinges, handles, locks)

**Definitely NOT reclaimable:**
- Professional fees (architect, engineer, surveyor, solicitor)
- Hire charges (scaffolding, plant, equipment, skips, portaloos)
- Tools and equipment
- Freestanding appliances (fridge, washing machine, dishwasher, tumble dryer, cooker)
- Carpets and underlay
- Freestanding furniture
- Garden items (sheds, greenhouses, garden furniture, plants, turf)
- Soft furnishings (curtains, blinds — unless integral/fitted blinds)
- AV equipment, broadband hardware
- Temporary works materials (hoarding, temp electrics)
- Finance costs, insurance
- Delivery charges billed separately from materials

**Mixed / needs specialist review:**
- Fitted wardrobes (reclaimable if built-in and fixed to the structure; not if freestanding)
- Built-in appliances (HMRC guidance is that built-in ovens/hobs that are part of fitted kitchen may qualify; seek advice)
- Solar PV panels (generally reclaimable as building material)
- MVHR units (generally reclaimable)
- Alarm and security systems (generally reclaimable if hard-wired)
- EV charger (likely reclaimable if hard-wired; relatively new — seek advice)
- Landscaping hardscape materials (paving, retaining walls — may qualify if part of building works)

#### Contractor Invoices (labour + materials combined)

- Labour and materials supplied by a **VAT-registered contractor** for construction of a new dwelling should be **zero-rated** (0% VAT charged). There is nothing to reclaim because no VAT should have been charged.
- If a contractor **incorrectly charges VAT** on labour for a new build, do NOT pay it and reclaim it later. Get the invoice corrected to zero-rate before paying. HMRC will not refund VAT that was incorrectly charged by a contractor.
- If a contractor is **not VAT-registered** (turnover under £90,000), they won't charge VAT at all. Nothing to reclaim.
- Materials-only invoices from builders' merchants that you pay directly ARE reclaimable (these are your direct purchases).

### Features

**Invoice Logging:**
- For every material purchase, log: date, supplier, description, net amount, VAT amount, invoice number
- Upload photo/scan of receipt
- Mark invoice as: Reclaimable / Not reclaimable / Needs review
- Mark source as: Direct purchase / Contractor invoice (zero-rated) / Contractor invoice (incorrectly charged VAT — flag for correction)

**Validation:**
- Flag invoices **over £250** that don't show claimant's name and site address
- Flag contractor invoices where VAT has been charged on labour+materials for new build (should be zero-rated — needs correction)
- Flag borderline items for manual review with guidance notes
- Flag missing supplier VAT registration numbers

**Dashboard:**
- Running total of reclaimable VAT
- Count of invoices: logged / validated / needs review / flagged for correction
- Countdown to claim deadline (6 months from completion certificate)
- Progress indicator showing completeness of documentation

**Export:**
- Generate HMRC-compatible schedule of invoices (matching the VAT431NB claim form format)
- Export all supporting documentation as organised PDF bundle
- Summary report for accountant review before submission

---

## Module 5: Planning / CIL / Conditions Tracker

Track planning status, discharge conditions, and manage the CIL exemption workflow. Missing any of these steps can invalidate your planning permission or cost you the full CIL charge.

### Planning Application Tracking

| Field | Description |
|-------|-------------|
| Application reference | Barnet planning reference number |
| Description | What the application is for |
| Status | Submitted / Validated / Consultation / Committee / Approved / Refused / Appealed |
| Decision date | When decision was made |
| Expiry date | Planning permission typically expires 3 years from grant |
| Link | URL to Barnet Public Access record |

**Barnet note:** Track your application at https://publicaccess.barnet.gov.uk/online-applications/ — search by address or reference number. Register for an account to receive email alerts on status changes.

### Planning Conditions Tracker

Each condition attached to your planning permission gets its own trackable entry:

| Field | Description |
|-------|-------------|
| Condition number | As numbered on the decision notice |
| Description | What the condition requires |
| Type | Pre-commencement / Pre-occupation / Ongoing / Informative |
| Status | Not started / Submitted / Discharged / Partially discharged |
| Submission date | When discharge application was submitted |
| Decision date | When Barnet confirmed discharge |
| Documents | Upload supporting evidence, discharge application, decision letter |
| Notes | Requirements, specialist input needed, etc. |

**Critical rule:** ALL pre-commencement conditions must be discharged before any work starts on site. Starting work with undischarged pre-commencement conditions can invalidate the entire planning permission.

**Barnet-specific notes:**
- Discharge of conditions applications are submitted separately and trackable on Public Access under "Associated Cases"
- Barnet has 8 weeks to determine discharge applications
- Common conditions for new builds in Barnet: materials samples, landscaping scheme, construction management plan, drainage/SuDS strategy, boundary treatments, parking/cycle storage details, biodiversity net gain

### CIL Self-Build Exemption Workflow

The app models the complete CIL exemption process as a checklist with blocking dependencies:

| Step | Form | When | Status Tracking |
|------|------|------|----------------|
| 1. Assume liability | **Form 2** (Assumption of Liability) | After planning granted, before commencement | Submitted / Acknowledged |
| 2. Receive Liability Notice | Issued by Barnet | Within ~1 month of planning approval | Received / Not yet received |
| 3. Claim self-build exemption | **Form 7 Part 1** | After Step 2, before commencement | Submitted / Approved / Refused |
| 4. **Wait for written confirmation** | Letter from Barnet | After Step 3 | **BLOCKING: No work until confirmed** |
| 5. Serve Commencement Notice | **Form 6** | Before first material operation on site | Submitted / Acknowledged |
| 6. Commence development | — | After Step 5 acknowledged | — |
| 7. Submit completion evidence | **Form 7 Part 2** | Within 6 months of completion certificate | Submitted / Accepted |
| 8. Occupy as sole/main residence | — | For minimum 3 years from commencement | Tracking with annual reminder |

**Alerts:**
- "CIL exemption not yet confirmed — do NOT start any work on site"
- "Commencement Notice not yet acknowledged — do NOT start any work on site"
- "CIL Form 7 Part 2 due within [X] days of completion"
- Annual reminder: "CIL 3-year occupancy requirement — [X] years remaining"
- "Warning: Demolition or site clearance constitutes commencement for CIL purposes"

**Barnet CIL rates (for reference):**
- Barnet CIL: £300/sqm base rate (indexed annually)
- Mayoral CIL (MCIL2): £60/sqm base rate (Barnet is Band 2, indexed annually)
- Both are additive. For ~184 sqm at indexed 2026 rates, the combined CIL liability without exemption would be substantial (potentially £70,000-£80,000+). This is why getting the exemption right is critical.

**Forms download:** https://www.planningportal.co.uk/planning/policy-and-legislation/CIL/download-the-forms/

---

## Module 6: Documents Vault

Every document related to the build, organised and searchable.

### Pre-Built Folder Structure

```
Planning
  ├── Planning application
  ├── Planning decision notice
  ├── Planning conditions
  ├── Condition discharge applications
  └── Approved drawings

Building Regulations
  ├── Full plans application
  ├── Approval notice
  ├── Structural calculations
  ├── SAP calculations (design stage + as-built)
  └── Completion certificate

CIL
  ├── Form 2 (Assumption of Liability)
  ├── Liability Notice
  ├── Form 7 Part 1 (Exemption Claim)
  ├── Exemption confirmation letter
  ├── Form 6 (Commencement Notice)
  └── Form 7 Part 2 (Post-completion evidence)

CDM
  ├── Principal Designer appointment
  ├── Principal Contractor appointment
  ├── Construction Phase Plan
  └── F10 notification (if applicable)

Contracts
  ├── Building contract (JCT/other)
  ├── Architect appointment
  ├── Structural engineer appointment
  └── Other professional appointments

Insurance & Warranty
  ├── Site insurance policy
  ├── Structural warranty
  ├── Contractor insurance certificates
  └── Professional indemnity certificates

Financial
  ├── Quotes and estimates
  ├── Invoices
  ├── Payment records
  └── VAT reclaim documentation

Certificates
  ├── Electrical Installation Certificate (Part P)
  ├── Gas Safety Certificate
  ├── Unvented hot water certificate (G3)
  ├── FENSA window certificate
  ├── Air tightness test result
  ├── EPC (Energy Performance Certificate)
  └── Completion certificate

Correspondence
  ├── Building control
  ├── Architect
  ├── Builder
  ├── Neighbours / Party wall
  ├── Barnet Council (planning, highways, CIL)
  └── Utilities

Site Photos
  ├── By phase
  ├── By room
  └── Concealed works (before covering)

Specifications
  ├── Material specifications
  ├── Product data sheets
  └── Samples log

Legal
  ├── Land purchase
  ├── Party wall notices and awards
  └── Land Registry

Highways & Licences
  ├── Dropped kerb application
  ├── Scaffold licence
  ├── Skip permits
  └── Hoarding licence
```

### Features

- Upload any file type (PDF, images, Word, Excel)
- Tag documents with: phase, category, contractor, date
- Search across document names and tags
- Version control — upload updated versions, keep history
- Drag-and-drop upload from desktop; photo upload from phone
- Preview PDFs and images inline
- Download individual files or entire folders as ZIP
- **"Required documents" checklist** — shows which essential documents are still missing (e.g. "Site insurance: not uploaded", "Gas Safe certificate: not uploaded")
- Auto-link uploaded certificates to relevant timeline tasks

---

## Module 7: Contacts Directory

Everyone involved in the build, with the details that matter.

### Contact Fields

| Field | Description |
|-------|-------------|
| Name | Person or company name |
| Role | Architect, structural engineer, builder, electrician, plumber, building control, warranty inspector, solicitor, mortgage broker, CDM principal designer, CDM principal contractor, etc. |
| Company | Company name |
| Phone | Phone number(s) |
| Email | Email address(es) |
| Address | Business address |
| Website | Company website |
| Notes | Free-text notes |
| Insurance expiry | Date their professional/public liability insurance expires |
| Qualifications | Relevant certifications (Gas Safe number, NICEIC, Part P, etc.) |
| Warranty/guarantee | Any warranty they provide on their work |
| Contract value | Total contract/quote value (owner-only visibility) |
| Rating | Personal 1-5 star rating after work is done |
| Active phases | Which build phases they're involved in |

### Pre-Loaded Barnet Contacts

The app ships with key Barnet council contact details:

| Contact | Details |
|---------|---------|
| Barnet Building Control | 020 8359 4500 (option 2), building.control@barnet.gov.uk |
| Barnet Planning | Via Public Access portal |
| Barnet CIL team | CIL@barnet.gov.uk |
| Barnet Highways (crossovers, scaffolding, skips) | 020 8359 3555, crossovers@barnet.gov.uk, highwayscorrespondence@barnet.gov.uk |
| Barnet Street Naming & Numbering | 020 8359 3555, highwayscorrespondence@barnet.gov.uk |
| Barnet Council Tax (new builds) | inspectors@barnet.gov.uk |
| HSE (CDM F10 notifications) | Online at hse.gov.uk |

### Features

- Pre-loaded role templates (architect, builder, electrician, plumber, etc.)
- Alert when a contractor's insurance is about to expire
- Link contacts to timeline tasks they're responsible for
- Link contacts to invoices/payments in the budget module
- Quick-call and quick-email buttons (essential for on-site phone use)
- Group by role type
- Search across all fields
- "Key contacts" pinned to top for quick access

---

## Module 8: Decisions Log

Track the hundreds of decisions you'll need to make, with deadlines so they don't hold up the build.

### Decision Fields

| Field | Description |
|-------|-------------|
| Decision title | e.g. "Choose kitchen supplier" |
| Category | Kitchen, Bathroom, Flooring, Electrical, Heating, External, Structural, Legal/Financial, Other |
| Status | Not started / Researching / Options shortlisted / Decided / Ordered |
| Deadline | Date by which decision must be made (linked to timeline) |
| Options | List of options being considered, each with: name, supplier, cost, pros, cons, link/attachment |
| Chosen option | Which option was selected |
| Decision date | When the decision was made |
| Decided by | Who made the decision |
| Notes | Context, reasoning, research links |
| Lead time | How long between ordering and delivery |
| Order-by date | Auto-calculated: deadline minus lead time |

### Pre-Loaded Decision Prompts

The app prompts decisions at the right time based on the timeline:

| When | Decisions to Make |
|------|------------------|
| **Pre-construction** | Builder selection, contract type, VAT approach (consult accountant), mortgage type, insurance provider, warranty provider, building control provider (Barnet in-house vs private) |
| **Before groundworks** | Foundation type confirmation, drainage strategy, utility routing |
| **Before superstructure** | Brick/block supplier and type, window supplier and spec, external door spec, structural steel supplier |
| **Before first fix** | Heating system (boiler vs ASHP vs hybrid), hot water strategy, electrical layout (socket positions, lighting plan), underfloor heating vs radiators, MVHR decision, smart home wiring, EV charger location |
| **Before second fix** | Kitchen supplier and design, bathroom design and sanitaryware, tiles (bathroom, kitchen, floors), internal door style, skirting/architrave profile, staircase balustrade design, paint colours, flooring types per room, light fittings, socket/switch style |
| **Before external works** | Driveway material, fencing style, landscaping plan, external lighting design |

### Features

- Sortable by deadline, status, category
- Filter by status (show me everything I haven't decided yet)
- Alert when a decision deadline is approaching
- Alert when "order by" date is approaching (deadline minus lead time)
- Link decisions to timeline tasks
- Attach images, brochures, links to each option
- Side-by-side comparison view for options
- Cost impact shown per option (feeds into budget)

---

## Module 9: Inspections Tracker

Never miss an inspection. Never cover work before it's been checked.

### Configurable Inspection Framework

Inspections are not a rigid universal list — they vary by project, building control provider, and local authority. The app ships with a **default set of common inspection points** that users can customise: add, remove, rename, or reorder.

#### Default Inspection Points

**Statutory (required by Building Regulations):**
- Commencement notification (2 working days notice)
- Final completion inspection (5 working days notice)

**Common inspection points (typical for most new builds):**
- Excavation for foundations (before concrete)
- Foundation concrete (before backfill)
- Oversite preparation (before slab pour)
- DPC (before covering)
- Below-ground drainage (before backfill; pressure/water test)
- Floor structure at each level (before covering)
- Structural steelwork/beams (before covering)
- Roof structure (before felt and battens)
- Pre-plaster / insulation (before boarding — the most important inspection)
- Final drain test
- Pre-occupation (5 working days notice)

**Project-specific (add as needed):**
- Party wall condition survey
- Warranty provider inspections (foundations, superstructure, pre-plaster, completion)
- Ecology/arboricultural compliance checks
- SuDS/drainage sign-off

#### Barnet Building Control Operational Notes

- Barnet runs its own in-house building control service (Barnet House, 1255 High Road, Whetstone, N20 0EJ)
- **Same-day inspections available**: Call before 10am (020 8359 4500, option 2); inspections happen between 11am-5pm that day
- First hour of surveyor consultation is free
- Alternative: you can use a private Registered Building Control Approver instead of Barnet

### Inspection Entry Fields

| Field | Description |
|-------|-------------|
| Name | Inspection name (from default list or custom) |
| Type | Building control / Warranty / Other |
| Linked task | Which timeline task triggers this inspection |
| Status | Not yet needed / Due / Booked / Passed / Conditional pass / Failed |
| Scheduled date | When the inspection is booked |
| Result | Pass / Conditional (with conditions noted) / Fail (with notes) |
| Inspector | Who conducted the inspection |
| Notes | Findings, conditions, follow-up required |
| Photos | Photos from the inspection |
| Checklist | What to have ready (pre-loaded per inspection type) |

### Features

- **Auto-linked to timeline** — when a task is marked complete that triggers an inspection, the app prompts: "Book inspection before proceeding"
- **Blocking warnings** — subsequent tasks show a warning that they cannot start until the inspection passes
- **Checklist per inspection** — what to have ready, what the inspector will look at
- **Result tracking** — Pass / Conditional pass (with conditions) / Fail (with notes)
- **Inspector contact details** — phone, email
- **Inspection history log** — date, result, notes, photos
- **Warranty inspections tracked alongside** building control inspections
- **Certificate tracking** — which certificates have been received, which are outstanding

---

## Module 10: Site Diary & Photos

Your daily record of everything that happens on site. Invaluable for disputes, insurance claims, and your own memory.

### Daily Log Entry Fields

| Field | Description |
|-------|-------------|
| Date | Auto-filled with today |
| Weather | Manual entry: temperature, conditions (sunny/cloudy/rain/snow/wind), wind strength |
| Who was on site | Checkboxes for known contractors + free text |
| Work completed today | Free-text description of progress |
| Issues / concerns | Anything that went wrong or needs attention |
| Deliveries | Materials delivered today |
| Visitors | Inspectors, consultants, other visitors |
| Health & safety | Any incidents or near-misses |
| Photos | Upload photos from the day |

### Photo Features

- **Upload from phone camera** directly into the app
- **Auto-timestamp and date** on every photo
- **Tag photos** by: room, phase, trade, type (progress / concealed work / issue / delivery)
- **Concealed works documentation** — special tag for photos of pipes, wires, insulation, backing wood BEFORE they get covered by plaster. Prompted automatically when first fix tasks are being completed.
- **Room-by-room gallery** — tap a room name to see all photos from that room chronologically
- **Phase gallery** — see all photos from a specific build phase
- **Bulk upload** — drag and drop multiple photos at once

### Features

- **Quick-entry mode** for days when you just want to note basics (weather, who was on site, one line of progress, photos)
- **Detailed mode** for comprehensive daily records
- **Calendar view** showing which days have entries (and gaps)
- Search across all diary entries
- Export diary as PDF (useful for disputes or records)
- Prompt to add an entry if no entry has been made for 2+ working days during active construction phases

---

## Module 11: Snag List

Track every defect found during and after construction.

### Snag Entry Fields

| Field | Description |
|-------|-------------|
| Title | Brief description (e.g. "Scratch on kitchen window") |
| Room / area | Which room or external area |
| Category | Structural / Cosmetic / Functional / Safety |
| Severity | Critical / Major / Minor |
| Photo(s) | Photo of the issue |
| Description | Detailed description |
| Responsible contractor | Who needs to fix this |
| Date found | When it was discovered |
| Deadline | When it should be fixed by |
| Status | Open / Assigned / In progress / Fixed / Verified |
| Resolution photo | Photo after fix |
| Resolution date | When it was resolved |
| Resolution notes | What was done to fix it |
| Verified by | Owner confirmation that fix is acceptable |

### Features

- **Room-based view** — see all snags grouped by room
- **Contractor view** — see all snags assigned to a specific contractor (shareable link — no login required)
- **Status board** — kanban: Open → Assigned → In Progress → Fixed → Verified
- **Severity filtering** — focus on critical/major items first
- **Export as PDF** — generate snag report for contractor with photos
- **Defect liability tracking** — countdown for each contractor's defect liability period (typically 6-12 months from completion). Alert before it expires so you can submit final snags.
- **Statistics** — total snags found, resolved, outstanding, by room, by contractor
- **Quick-add** — rapid entry mode for the initial snagging walkthrough (title + photo + room, fill details later). Optimised for phone use.

---

## CDM (Construction Design and Management) Compliance

Not a separate module — CDM tracking is integrated into the Timeline (Phase A tasks) and Documents Vault. This section documents the rules the app needs to enforce.

### When CDM Applies

CDM 2015 applies to **all construction projects**, including domestic. As a domestic client, your duties transfer automatically:
- **Single contractor:** all client duties transfer to the contractor
- **Multiple contractors:** client duties transfer to the Principal Contractor
- **Alternative:** you can enter a written agreement for the Principal Designer to take on client duties instead

### Appointments Required (if more than one contractor)

| Role | Who | Duties |
|------|-----|--------|
| **Principal Designer** | Typically your architect | Manages H&S in pre-construction phase; coordinates designers; identifies and eliminates/reduces risks through design |
| **Principal Contractor** | Typically your main builder | Manages H&S during construction; prepares Construction Phase Plan; ensures site induction, welfare, security |

If you don't formally appoint them, the duties default to whoever is in control of each phase — but formal appointment is strongly recommended.

### Construction Phase Plan

Required on **every project** before construction begins. Prepared by the Principal Contractor (or sole contractor). Must cover:
- Project description and team
- Management structure and responsibilities
- Site rules, induction, welfare, emergency procedures
- Risk controls for: excavations, structures, lifting, plant, traffic, materials storage
- Health risk controls for: contaminated land, manual handling, noise, dust

### F10 HSE Notification

Required if the project meets **EITHER** threshold:
1. **More than 30 working days** of construction AND **more than 20 workers on site simultaneously** at any point
2. **More than 500 person-days** of construction in total

For a ~184 sqm house with a typical crew of 4-8, you're unlikely to hit threshold 1 but may approach threshold 2 on a longer build. The app tracks person-days against the 500 threshold and alerts if approaching.

---

## Barnet-Specific: Street Works & Highway Licences

Not a separate module — tracked as tasks in the Timeline and documents in the Documents Vault. This section documents Barnet-specific requirements.

### Highway Licences Required

If any construction activity encroaches on the public highway or footway, you need licences from Barnet:

| Activity | Licence Fee | Deposit | Notes |
|----------|------------|---------|-------|
| Scaffolding on/over highway | £258.77 | £787.75 min | — |
| Hoarding on highway | £258.77 | £787.75 min | — |
| Building materials on highway | £258.77 | £345.91 min | — |
| Skip on highway | £45.18/week | — | Skip company applies, not you |
| Crane over-sailing | £1,817.50 (3-month min) | — | — |

- Apply online via Barnet highways portal
- Council inspects within 48 hours; licence issued within 3-4 working days
- Deposits refunded after final inspection confirms no highway damage

### Dropped Kerb / Vehicle Crossover

- Apply via Barnet at https://account.barnet.gov.uk
- Application fee: £254.48 (non-refundable, includes site survey)
- If approved: legal agreement fee (£275.93) + construction costs (Barnet constructs it)
- Allow 3-6 months total
- Domestic crossovers have 3,500kg max load — won't take skip lorries or HGVs during construction. Consider temporary construction access arrangements separately.

### Street Naming & Numbering

- Apply to Barnet at least 3 months before intended occupation
- Fee: £137.84 per property
- Processing: 5-6 weeks for straightforward cases
- You must separately activate the address with Royal Mail
- Contact: highwayscorrespondence@barnet.gov.uk

---

## Barnet-Specific: Completion Admin

Tracked as tasks in Phase K of the Timeline.

### Council Tax Registration

- Barnet will issue a **Completion Notice** when the property is "structurally complete" (this can be before internal finishes are done)
- Barnet officers visit sites and take photographic evidence to determine completion dates
- A Completion Notice can be issued **up to 3 months before** anticipated completion
- Once issued, the **Valuation Office Agency (VOA)** bands the property
- To register proactively: email **inspectors@barnet.gov.uk** with property address, your name, completion date, and purchase/tenancy start date
- Appeal a Completion Notice within **28 days** to the Valuation Tribunal Service if you disagree

### SuDS / Drainage Condition Discharge

If your planning conditions include a drainage/SuDS strategy (common in Barnet):
- Follow Barnet's surface water discharge hierarchy: (1) infiltration, (2) water body, (3) surface water sewer, (4) combined sewer (last resort)
- Post-development discharge rate must match greenfield runoff rates
- Submit drainage strategy for condition discharge well before groundworks begin
- Barnet SuDS form available at barnet.gov.uk
- Pre-application drainage advice available (chargeable): swm@barnet.gov.uk

---

## Cross-Cutting Features

### Notifications & Alerts System
All modules feed into a unified alert system displayed on the dashboard and sent via email.

**Alert priorities:**
- **Critical** — Overdue tasks, inspection needed before work can proceed, insurance expiring today, CIL form deadline imminent, VAT reclaim deadline approaching
- **Warning** — Tasks due this week, decision deadlines approaching, budget category over by >10%, contractor insurance expiring within 30 days
- **Info** — Upcoming milestones, new activity from collaborators, planning condition reminders

### Search
- Global search across all modules
- Search documents by name and tag
- Search diary entries, decision log, contacts

### Activity Feed
- Chronological log of all actions across all modules
- Filter by module, user, date range
- Shows: who did what, when, in which module

### Data Export
- Export any module's data as CSV or PDF
- Full project export for backup
- VAT reclaim export in HMRC format

### Mobile Responsive
- All modules fully functional on phone and tablet
- Photo upload optimised for phone camera
- Quick-add modes for on-site use (diary entry, snag, photo)
- Large tap targets and clear buttons for on-site glove use

---

## Data Model (High Level)

### Core Entities

```
User
  - id, name, email, role (owner/collaborator/viewer), password_hash

Project
  - id, name, address, local_authority, total_budget, contingency_pct,
    start_date, target_completion

Phase
  - id, project_id, name, order, status, start_date, end_date

Task
  - id, phase_id, title, description, status, assignee_id, start_date, due_date,
    actual_start, actual_end, depends_on (task_ids), is_milestone, inspection_required

BudgetCategory
  - id, project_id, name, allocated_amount, typical_pct

BudgetEntry (quotes, invoices, payments)
  - id, category_id, type (quote/invoice/payment), supplier, description, amount,
    vat_amount, date, status, receipt_path, vat_reclaimable

VATEntry
  - id, budget_entry_id, invoice_number, supplier_name, supplier_vat_number,
    description, net_amount, vat_amount, invoice_total,
    source (direct_purchase/contractor_zero_rated/contractor_vat_error),
    reclaimable (yes/no/needs_review), has_claimant_name_address (boolean),
    receipt_path, validated, notes

PlanningCondition
  - id, project_id, condition_number, description, type (pre_commencement/
    pre_occupation/ongoing/informative), status, submission_date, decision_date,
    documents, notes

CILStep
  - id, project_id, step_number, form_name, status, submitted_date,
    confirmed_date, deadline, documents, notes

Document
  - id, project_id, folder, name, file_path, tags, uploaded_by, uploaded_at, version

Contact
  - id, project_id, name, role, company, phone, email, insurance_expiry,
    qualifications, rating, notes

Decision
  - id, project_id, title, category, status, deadline, lead_time_days,
    order_by_date, chosen_option_id, decided_date, notes

DecisionOption
  - id, decision_id, name, supplier, cost, pros, cons, attachments

Inspection
  - id, project_id, type (building_control/warranty/other), name, status,
    scheduled_date, result, conditions, notes, linked_task_id, is_custom

DiaryEntry
  - id, project_id, date, weather_temp, weather_conditions, weather_wind,
    workers_on_site, work_completed, issues, deliveries, visitors, notes

Photo
  - id, project_id, diary_entry_id (optional), file_path, timestamp, room, phase,
    trade, type (progress/concealed/issue/delivery), tags

Snag
  - id, project_id, title, room, category, severity, description, photo_path,
    responsible_contact_id, date_found, deadline, status, resolution_photo_path,
    resolution_date, resolution_notes, verified_by

Warranty
  - id, project_id, item, manufacturer, period_years, start_date, expiry_date,
    document_path, claim_contact, notes

MaintenanceTask
  - id, warranty_id (optional), project_id, title, frequency, last_completed,
    next_due, notes
```

---

## Pre-Loaded Reference Data

The app ships with UK-specific reference data so users don't start from a blank page:

1. **Complete self-build timeline template** (all phases, tasks, dependencies, inspection triggers)
2. **Budget categories with typical percentages** and North London benchmark costs
3. **VAT reclaimable/non-reclaimable item rules** per HMRC VAT431NB (with £250 threshold and 6-month deadline)
4. **Configurable inspection schedule** with checklists per inspection type
5. **CIL self-build exemption workflow** with all forms and blocking dependencies
6. **Decision prompts** timed to each phase
7. **Document folder structure** with "required documents" checklist
8. **Contact role templates** including pre-loaded Barnet council contacts
9. **Barnet-specific operational notes** (building control, highways, street naming, council tax)

---

## Out of Scope (not planned)

- Native mobile apps (iOS/Android) — responsive web is sufficient
- Multi-project support — this is for one build
- Integration with accounting software (Xero, QuickBooks)
- Integration with building control booking systems
- Real-time messaging/chat between users
- 3D model / BIM viewer

---

## Success Criteria

The app is successful if:
1. Jayesh and wife can see at a glance where the project stands (phase, budget, next actions)
2. No building control inspection is missed or work covered prematurely
3. Every receipt is logged for VAT reclaim with correct categorisation, and the HMRC claim is submitted on time
4. The CIL self-build exemption process is followed correctly with no forms missed
5. All pre-commencement planning conditions are discharged before work starts
6. Every decision is tracked with deadline, avoiding costly last-minute panic choices
7. All important documents are in one place, findable in seconds
8. Budget is tracked accurately enough to catch overruns early
9. The snag list at completion is comprehensive and drives contractor rectification
10. Collaborators (builder, architect) can update their tasks without seeing sensitive financial data
11. The app works well on a phone on-site
