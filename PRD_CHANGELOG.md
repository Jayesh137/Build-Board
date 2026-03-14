# PRD Changelog

## What Was Kept

- Overall document structure (modules, tables, data model approach)
- Dashboard layout and alert system design
- Timeline with pre-loaded UK self-build phases and task dependencies
- Budget categories with typical percentages and North London benchmarks
- Documents Vault with pre-built folder structure
- Contacts Directory with fields and features
- Decisions Log with pre-loaded prompts by phase
- Site Diary & Photos with concealed works documentation
- Snag List with defect liability tracking and contractor sharing
- User roles (Owner / Collaborator / Viewer)
- Core data model entities
- Success criteria (expanded)

## What Was Changed

### Regulatory Corrections

**VAT Reclaim (Module 4) — substantially rewritten:**
- Fixed invoice threshold: £250 (was incorrectly £100)
- Clarified deadline rules: 6 months for completions on/after 5 Dec 2023; 3 months for earlier
- Restructured into clear categories: goods purchased directly by self-builder, contractor invoices (should be zero-rated), definitely reclaimable, definitely not reclaimable, mixed/needs specialist review
- Added guidance on contractor VAT errors (don't pay and reclaim — get invoice corrected)
- Added supplier VAT number requirement
- Added built-in appliances, solar PV, MVHR, EV charger, alarm systems to "needs review" category
- Removed "fitted wardrobes" from non-reclaimable (they can be reclaimable if built-in)

**CIL — new module (Module 5: Planning / CIL / Conditions Tracker):**
- Modelled complete CIL self-build exemption workflow: Form 2 → Liability Notice → Form 7 Part 1 → Written confirmation → Form 6 → Commencement → Form 7 Part 2
- Added blocking dependency: no work until written exemption confirmation received
- Added commencement risk warning: demolition and site clearance constitute commencement
- Added 3-year occupancy tracking with annual reminders
- Added Barnet CIL rates (£300/sqm + £60/sqm Mayoral, both indexed)
- Added link to Planning Portal forms download

**Building Control (Module 9, renamed from Module 8):**
- Replaced rigid "13 mandatory inspections" with configurable inspection framework
- Split into: statutory inspections, common inspection points, project-specific inspections
- Added Barnet-specific operational note: same-day inspections available if called before 10am
- Added Barnet building control contact details and location (Barnet House, Whetstone)
- Added option to use private Registered Building Control Approver

**CDM / HSE — new dedicated section:**
- Corrected F10 notification thresholds: >30 working days AND >20 workers simultaneously, OR >500 person-days (was incorrectly stated as just >30 days + >20 workers)
- Added domestic client duty transfer rules (single vs multi-contractor)
- Added Principal Designer and Principal Contractor appointment requirements
- Added Construction Phase Plan requirements
- Added person-days tracking against 500 threshold with alert

### Architecture & Scope

**Tech stack — replaced:**
- Database: PostgreSQL via Supabase/Neon (was SQLite) — multi-user web app needs proper concurrent DB
- File storage: Supabase Storage or S3-compatible (was local filesystem) — needs to work across devices
- Auth: Supabase Auth or Lucia (was "simple session-based") — needs proper invite/magic link flow
- Deployment: Vercel + Railway/Render (was "local dev or free-tier host") — more specific
- Added rationale for the change

**MVP vs Post-MVP — new section added:**
- Clear split between what to build first and what to defer
- Gantt chart moved to post-MVP (use list/board views first)
- Critical path highlighting moved to post-MVP
- Weather API integration moved to post-MVP (manual weather in site diary is sufficient)
- Warranty & Maintenance module moved to post-MVP (only needed after completion)
- Procurement/POs, Variations/Change Orders, Funding/Cashflow, Meetings/RFIs, Room Data Sheets all listed as post-MVP with notes on how MVP modules cover the need initially

### Barnet-Specific Additions

- Planning application tracking via Barnet Public Access portal (URL included)
- Barnet building control: in-house service, same-day inspection process, free first-hour consultation, contact details
- Barnet CIL rates and contact (CIL@barnet.gov.uk)
- Barnet street naming & numbering: process, fees (£137.84/property), timeline, contact
- Barnet dropped kerb / vehicle crossover: process, fees (£254.48 application), 3,500kg load limit note
- Barnet scaffold/skip/hoarding licence fees and process
- Barnet SuDS/drainage requirements and discharge hierarchy
- Barnet council tax for new builds: Completion Notice process, proactive registration email, appeal rights
- Pre-loaded Barnet council contacts in Contacts Directory
- Barnet-specific notes in planning conditions section (common conditions, 8-week determination)

### Contradiction Fixes

- **Weather:** Removed Module 12 (Weather Monitor) as standalone module. Weather data is now manual entry in Site Diary (MVP). Weather API integration, schedule overlay, and smart weather alerts are listed as post-MVP features. This resolves the contradiction where weather was both "manual in v1" and described as API-powered.
- **Gantt chart:** Listed as post-MVP. Timeline MVP uses list view and board view instead.
- **Voice-to-text notes:** Moved to post-MVP (browser support is patchy)
- **Before/after photo slider:** Moved to post-MVP (nice-to-have visualisation)
- **Offline mode:** Remains post-MVP with explicit note

### Other Improvements

- Phase A timeline: added CIL form workflow tasks with blocking dependencies, CDM tasks, street naming, scaffold licence
- Phase B: added commencement warning about CIL implications of demolition/site clearance
- Phase K: renamed to "Completion Admin & Move-In", added utility connection, CIL 3-year tracking
- Documents Vault: added CIL folder, CDM folder, Highways & Licences folder
- Contacts Directory: added CDM roles (principal designer, principal contractor)
- Data model: added PlanningCondition entity, CILStep entity, expanded VATEntry with source field, supplier_vat_number, invoice_total, has_claimant_name_address
- Success criteria: added CIL compliance, planning condition discharge, and mobile/on-site usability
- Removed emoji from alert priorities (keeping the doc clean)
- Tightened wording throughout to be more direct and actionable

## What Was Added

| Addition | Where |
|----------|-------|
| MVP vs Post-MVP scope split | New top-level section |
| Module 5: Planning / CIL / Conditions Tracker | New module |
| CDM Compliance section | New section (integrated, not standalone module) |
| Barnet: Street Works & Highway Licences | New section (integrated, not standalone module) |
| Barnet: Completion Admin | New section (integrated, not standalone module) |
| Barnet: SuDS / Drainage Condition Discharge | Within Completion Admin section |
| Pre-loaded Barnet council contacts | Within Contacts Directory |
| CIL and CDM document folders | Within Documents Vault |
| PlanningCondition data entity | Within Data Model |
| CILStep data entity | Within Data Model |

## What Was Removed

| Removed | Reason |
|---------|--------|
| Module 12: Weather Monitor (as standalone module) | Over-scoped for MVP. Manual weather entry in Site Diary is sufficient. API integration is post-MVP. |
| Cash flow timeline visualisation | Moved to post-MVP. Budget tracking covers the need. |
| Gantt chart as MVP feature | Moved to post-MVP. List and board views are simpler and more useful to start. |
| "Automatic weather data fetching" in Out of Scope | Redundant once Weather Monitor module was removed |
| Voice-to-text notes | Moved to post-MVP |
| Before/after photo slider | Moved to post-MVP |
| 7-day weather forecast on dashboard | Replaced with undischarged planning conditions count |

## What Was Moved from MVP to Post-MVP

1. Gantt chart visualisation → use list/board views first
2. Critical path highlighting → requires full dependency engine
3. Weather API integration → manual diary entry is enough
4. Weather schedule overlay and smart alerts → depends on API
5. Warranty & Maintenance module → only needed after completion
6. Procurement / Purchase Orders → budget module + decisions log covers it
7. Variations / Change Orders / Retentions → budget module covers it
8. Funding / Cashflow / Stage Drawdowns → budget module with notes covers it
9. Meetings / Actions / RFI Tracker → site diary + decisions log covers it
10. Room Data Sheets / Finish Schedules → decisions log + documents vault covers it
11. Handover Pack generator → only needed post-completion
12. Before/after photo slider → nice-to-have
13. Voice-to-text → patchy browser support
14. Offline mode → build for connectivity first
15. AI receipt OCR → manual entry is fine
16. Multi-user real-time collaboration → refresh-based updates first
