# BuildTracker - UI/UX Design System

## Design DNA

Linear meets construction. A premium productivity tool that happens to be about building a house. Clean, calm, information-dense without feeling cluttered.

## Inspiration

- **Primary:** Linear, Notion — clean, minimal, keyboard-friendly, subtle animations, dark/light mode
- **Gamification:** Subtle — Duolingo-level celebration at milestones, but professional throughout
- **Not:** Instagram-visual or Duolingo-heavy. No childish animations, no points/XP, no leaderboards.

## Core Principles

1. **Information density over decoration** — Every pixel earns its place. No hero images, no decorative illustrations. Data is the content.
2. **Progressive disclosure** — Show the summary first, details on tap/click. List → detail → edit. Never overwhelm.
3. **Status at a glance** — Colour-coded badges, progress indicators, and subtle iconography let you scan a page and know where things stand without reading.
4. **Mobile-first, desktop-enhanced** — Design for the phone-on-site experience first. Desktop gets the same layout with more columns and breathing room.

## Visual Language

### Colour Palette

**Base:** Neutral slate/zinc greys, white surfaces.

| Token | Usage | Value (light) | Value (dark) |
|-------|-------|---------------|-------------|
| `bg-primary` | Page background | zinc-50 | zinc-950 |
| `bg-surface` | Cards, panels | white | zinc-900 |
| `bg-surface-hover` | Hover states | zinc-50 | zinc-800 |
| `bg-active` | Active nav item, selected row | indigo-50 | indigo-950 |
| `text-primary` | Body text | zinc-900 | zinc-100 |
| `text-secondary` | Secondary/muted text | zinc-500 | zinc-400 |
| `text-accent` | Links, active items | indigo-600 | indigo-400 |
| `border-default` | Card borders, dividers | zinc-200 | zinc-800 |

**Semantic status colours (used only for status, never decorative):**

| Status | Colour | Usage |
|--------|--------|-------|
| Done / Passed / Reclaimable | green-600 | Completed tasks, passed inspections, VAT reclaimable |
| In Progress / Warning | amber-500 | Active tasks, approaching deadlines, needs review |
| Overdue / Failed / Critical | red-600 | Overdue tasks, failed inspections, budget overrun |
| Info / Not Started | blue-500 | Informational alerts, upcoming items |
| Blocked | red-400 + lock icon | CIL blocking, inspection blocking |

**Accent:** Indigo-600 for primary buttons, active states, links. One accent colour only.

### Typography

- **Font:** Inter (loaded via Google Fonts) with system font fallback
- **Scale:** 12px (xs), 14px (sm/body), 16px (base), 18px (lg), 24px (xl), 30px (2xl), 36px (3xl)
- **Weights:** 400 (body), 500 (medium/labels), 600 (semibold/headings)
- **Numbers:** Tabular numerals (`font-variant-numeric: tabular-nums`) for amounts, dates, counts — so columns align
- **No decorative fonts.** One type family throughout.

### Spacing

- **Grid:** 4px base unit
- **Component padding:** 12px (compact), 16px (default), 24px (spacious)
- **Card padding:** 16px mobile, 24px desktop
- **List item height:** 44px minimum (touch target)
- **Section gap:** 24px between major sections, 12px between related items

### Borders & Elevation

- **Borders:** 1px solid `border-default`. No drop shadows on cards.
- **Elevation:** Background colour changes only (surface → surface-hover). Flat design.
- **Radius:** 6px for cards and inputs, 4px for badges, 9999px for pills/avatars
- **Focus rings:** 2px indigo-500 ring offset by 2px (accessibility)

### Icons

- **Library:** Lucide icons (clean, consistent, MIT licensed, works well with Svelte)
- **Size:** 16px in nav/badges, 20px in buttons, 24px as standalone
- **Style:** Stroke only (outline), 1.5px stroke weight to match Inter

### Animations

- **Page transitions:** Crossfade, 200ms ease
- **Mobile detail pages:** Slide in from right, 250ms ease
- **Status changes:** Background colour transition, 300ms ease
- **Progress bars:** Fill animation, 500ms ease-out
- **Milestone celebrations:** Scale-up + fade-in, 400ms
- **No:** Bouncing, parallax, spring physics, loading skeletons that flash

## Navigation

### Desktop (≥1024px)

Collapsible left sidebar (240px → 64px icon-only) + main content area.

```
┌─────────┬──────────────────────────────────────────┐
│ Project │  Page Title              [+ Add Task]     │
│ ◯ 47%   ├──────────────────────────────────────────│
│         │                                           │
│ OVERVIEW│  Content area                             │
│ ▸ Dash  │                                           │
│         │                                           │
│ BUILD   │                                           │
│   Time  │                                           │
│   Insp  │                                           │
│         │                                           │
│ MONEY   │                                           │
│   Budg  │                                           │
│   VAT   │                                           │
│         │                                           │
│ COMPLI  │                                           │
│   Plan  │                                           │
│         │                                           │
│ MANAGE  │                                           │
│   Deci  │                                           │
│   Cont  │                                           │
│         │                                           │
│ SITE    │                                           │
│   Diary │                                           │
│   Photo │                                           │
│   Snags │                                           │
│         │                                           │
│ FILES   │                                           │
│   Docs  │                                           │
│         │                                           │
│ ──────  │                                           │
│ ⚙ Set   │                                           │
│ 👤 User │                                           │
└─────────┴──────────────────────────────────────────┘
```

**Nav groups:** Overview, Build, Money, Compliance, Manage, Site, Files

**Active state:** Subtle indigo background on active item. Bold text weight.

**Badges:** Small count indicators next to nav items (e.g. Snags: 5, Decisions: 3 pending).

**Collapse:** Toggle to icon-only mode. Icons remain, labels hide. Hover shows tooltip.

### Mobile (<1024px)

Bottom tab bar (5 tabs) + full-screen "More" menu.

```
┌──────────────────────────────────────┐
│ ← Timeline                [+ Add]    │
│──────────────────────────────────────│
│                                      │
│ Content area (full width, 16px pad)  │
│                                      │
│                                      │
│                                      │
│──────────────────────────────────────│
│ 🏠  📋  💰  📝  ••• │
│ Home Time Budg Diary More            │
└──────────────────────────────────────┘
```

**Bottom tabs:** Dashboard, Timeline, Budget, Diary, More

**"More" opens:** Full-screen grid of remaining modules (Planning, VAT, Contacts, Decisions, Inspections, Documents, Photos, Snags, Settings). Each as an icon + label card.

**Detail pages:** Slide in from right with back arrow. Primary action button in top-right.

## Gamification Layer

Woven into existing UI, never a separate system. Feels like natural progress feedback.

### Progress Indicators

- **Dashboard progress ring:** Large circular SVG ring showing overall completion (% of tasks done). Centre shows percentage number. Ring colour transitions from indigo → green as it fills.
- **Phase progress bar:** Horizontal segmented bar on dashboard. Each segment = one phase. Fills left-to-right as phases complete. Grey → indigo (active) → green (done).
- **Module progress:** Small progress text in each page header. E.g. "23 of 31 invoices validated" on VAT page, "67% budget allocated" on Budget page.
- **CIL steps:** Horizontal step indicator (like checkout flow). Circles connected by lines. Filled = done, outlined = pending, lock icon = blocking.

### Milestone Celebrations

When a milestone task is completed (Planning Approved, Weathertight, Building Complete, Move In):

1. Brief full-screen overlay (2 seconds, dismiss on tap)
2. Large checkmark draws in (SVG animation)
3. Subtle confetti burst (small, muted colours — not rainbow)
4. Milestone name in large type beneath
5. Overlay fades out

After dismissal, milestone appears as a **badge** in the Dashboard "Milestones" row — small circular icons with milestone name.

### Streaks

- **Diary streak:** Small flame icon + "12-day streak" text on Diary page header during active construction.
- Not punitive. Missing days shows neutral "Last entry: Tuesday" — no broken streak shame.
- Dashboard nudge after 2+ missed working days: "No diary entry since Tuesday" as an info-level alert.

### Phase Completion

When all tasks in a phase are marked done:
- Phase row in timeline transitions to completed state: green-50 background, green check icon, text changes to "Phase complete"
- Smooth 300ms transition, not abrupt

### Progress Numbers

Use countup animations when dashboard first loads:
- Budget spent: counts up from 0 to actual
- Progress percentage: ring fills from 0 to actual
- Duration: 800ms ease-out
- Only on first load, not on navigation back

## Component Patterns

### Cards

```
┌────────────────────────────────────┐
│ Card Title              Badge      │
│ Secondary text                     │
│                                    │
│ Content                            │
│                                    │
│ Footer / actions                   │
└────────────────────────────────────┘
```

- 1px border, 6px radius, 16-24px padding
- No shadow. Surface background.
- Hover: surface-hover background (on interactive cards)

### Status Badges

Small pill-shaped badges: `rounded-full px-2 py-0.5 text-xs font-medium`

| Status | Style |
|--------|-------|
| Done | green bg, green text |
| In Progress | amber bg, amber text |
| Not Started | zinc bg, zinc text |
| Blocked | red bg, red text + lock icon |
| Overdue | red bg, white text (filled) |

### List Items

```
┌──────────────────────────────────────────────────┐
│ ○  Task title                    Badge   Mar 15  │
│    Assigned to: Builder Name              ▸      │
└──────────────────────────────────────────────────┘
```

- 44px min height (touch target)
- Left: status indicator (circle/check/dot)
- Centre: title (primary) + subtitle (secondary text)
- Right: badge + date + chevron
- Divider between items: 1px border-default

### Forms

- Labels above inputs, 4px gap
- Input height: 40px (desktop), 44px (mobile)
- Full-width on mobile, max-width 640px on desktop
- Grouped in sections with section headings
- Primary action button: indigo, full-width on mobile, right-aligned on desktop
- Cancel/secondary: ghost button (text only)

### Empty States

When a module has no data:
- Centre-aligned icon (48px, muted colour) + heading + one-line description + primary action button
- E.g. "No invoices yet" + "Start tracking your build costs" + [Log First Invoice]

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Single column, bottom tabs, 16px padding |
| Tablet | 640-1023px | Single column, wider cards, bottom tabs |
| Desktop | ≥ 1024px | Sidebar + main content, multi-column where useful |

## Dark Mode

Support both light and dark mode via Tailwind's `dark:` variant. Respect system preference by default with manual toggle in settings.

Dark mode uses zinc-900/950 backgrounds, zinc-100 text. Same semantic status colours work in both modes. Accent stays indigo.
