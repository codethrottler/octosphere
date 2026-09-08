# OctoSphere — Architecture

OctoSphere is an enterprise employee workplace platform: HRMS + Workforce
Management + Task Management + Internal Service Desk + Analytics, under one
shell. This document is the source of truth for how the codebase is put
together. Read it (along with `CONVENTIONS.md` and `MODULE_PLAN.md`) before
adding a new module or shared primitive.

## Status

This is the first build session. Nothing existed before it — no shell, no
shared components, no modules. The **Unified Dashboard** (`/dashboard`) is
the first thing built, on top of a shell and a small shared component
library also built in this session. Every other module in the nav tree
(HRMS, My Work, Service Desk, Reports & Analytics, Administration) is a
placeholder route until its own session builds it. See `MODULE_PLAN.md` for
what's built vs. planned.

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript, built with Vite |
| Routing | React Router v7 (`BrowserRouter`, declarative `<Routes>`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme` tokens — no `tailwind.config.js`) |
| Charts | Recharts (currently just the donut chart in `DonutCard`) |
| Icons | lucide-react |
| Class merging | clsx |
| State | React context for cross-cutting session/notification state; local component state otherwise. No global store (Redux/Zustand) — not needed at this scale yet |
| Data | No backend yet. Every module reads from typed mock data behind a thin hook, so wiring a real API later doesn't touch components (see "Data & the mock-to-real seam" below) |

No server-state library (React Query, SWR, etc.) is wired in yet because
there is nothing to fetch. Add one when the first real API lands rather
than pre-installing it now.

## Top-level layout

```
src/
  app/                   Shell chrome and app-wide concerns — not a "module"
    shell/               AppShell, IconRail, TopBar, nav.config.ts
    session/             Current user + role, as React context
    notifications/       Notification read/unread state, as React context
    pages/                ModulePlaceholderPage (stub for unbuilt modules)
    routes.tsx            Central route table
  shared/                Reusable across modules — components, analytics, utils
    components/          <ComponentName>/<ComponentName>.tsx, one dir per component
    analytics/            Cross-module aggregation functions + their mock sources
    notifications/         Notification types/mock/selectors (shared shell + module)
    utils/                Formatters etc.
  modules/
    dashboard/            The Unified Dashboard (this session's deliverable)
      DashboardPage.tsx
      dashboard.config.ts  Tab list + per-tab role gate
      tabs/                One component per sub-page
      mock/                Mock data belonging only to this module
      data/                use<Feature>() hooks — the swap point for real APIs
```

A future module (e.g. `modules/hrms`) follows the same `tabs|pages/`,
`mock/`, `data/` shape as `modules/dashboard`.

## The Unified Dashboard vs. per-module Overview pages

These are two different things and must not be confused:

- **`/dashboard`** (this session) is the app's landing page — one level
  above the 5 functional modules in the icon rail, not nested under any of
  them. It gives a cross-module glance plus role-specific and personal
  snapshots.
- **Each module's own "Overview" page** (e.g. an HRMS Overview once HRMS is
  built) lives *inside* that module and is scoped to it.

Where the two would show near-identical data (Dashboard's HR Overview tab
vs. a future HRMS Overview; Dashboard's Executive Overview vs. a future
Reports Executive Reports page), the aggregation logic lives once in
`shared/analytics/` and both pages call it. See the next section.

## Data & the mock-to-real seam

Every screen gets its data from a `use<Feature>()` hook in that module's
`data/` folder, never by importing a mock file directly into a component.
The hook is the seam: today it returns mock data synchronously, later it
becomes a real fetch/query, and the component doesn't change either way.

```
component  →  use<Feature>() hook  →  { mock data today, real API later }
```

**Cross-module aggregations do not live inside a single module.** Metrics
that multiple screens need — Executive Overview's org-wide summary, HR
Overview's headcount/department numbers — live in `shared/analytics/` as a
plain function (e.g. `getExecutiveSummary()`, `getHrSummary()`) over shared
mock source files (`orgData.mock.ts`, `taskData.mock.ts`,
`ticketData.mock.ts`). Each module's `data/use*.ts` hook wraps the shared
function. This is deliberate: it is the mechanism that stops "don't build
two implementations of the same aggregation" from being just a comment —
when Reports & Analytics is built, its Executive Reports page imports
`getExecutiveSummary()` too, instead of re-deriving the same KPIs from
scratch.

Module-local mock data (e.g. a tab's own recent-activity feed) stays in
that module's `mock/` folder — only cross-module numbers move to
`shared/analytics/`.

## Notifications: shared state, not duplicated state

The header bell badge (shell chrome) and the Notifications & Alerts screen
(a Dashboard tab) both need the same read/unread notification state. That
state is owned by `app/notifications/NotificationsProvider.tsx`, mounted
once in `App.tsx`, and read via `useNotifications()` from both places. This
avoids the bell showing a different unread count than the list underneath
it.

## Roles & permission gating

`app/session/SessionContext.tsx` exposes the current user and a
`hasRole(...roles)` check. A screen gates on "does the user have *any* of
these roles" (a user can hold multiple roles), never a single exclusive
role. `shared/components/PermissionGate` renders an inline "no access"
panel instead of hiding a tab outright — the tab is still discoverable, its
content just isn't. Team Overview (`manager`/`admin`) and HR Overview
(`hr`/`admin`) in the Dashboard are the first two screens to use this.

There's no real auth yet — `currentUser.mock.ts` stands in for the
authenticated session.

## Shell navigation

The icon rail has 6 entries: **Home** (the Unified Dashboard) plus the 5
functional modules (HRMS, My Work, Service Desk, Reports & Analytics,
Administration). Home is first in the rail and is also where the
`OctoSphere` wordmark in the top bar links. See `nav.config.ts`.

The Dashboard's 7 sub-pages (Executive/My/Team/HR/Task/Service Desk
Overview + Notifications & Alerts) are tabs on the single `/dashboard`
route, switched via a `?tab=` query param — not separate nested routes.
This was a deliberate choice over per-tab routes: it keeps the Dashboard as
one conceptual page with fast, no-reload switching, while `?tab=` still
makes each sub-page linkable (the header bell links straight to
`?tab=notifications`, for example).

## Forward-looking notes for modules not yet built

These aren't decisions this session enforces in code (there's nothing to
enforce yet) — they're constraints the next session building each module
should follow, written down now so they aren't rediscovered later:

- **Service Desk** (HR Desk / IT Desk / Admin Desk) must share one ticket
  engine, SLA engine, assignment system, notification system, comment
  system, attachment system, audit system, workflow engine, and reporting
  engine across all three desks. The three desks are a *view* over shared
  data (e.g. a `desk` field/category), not three separate ticketing
  systems with duplicated schemas or logic.
- **Reports & Analytics** should reuse `shared/analytics/` aggregations
  wherever a Dashboard tab already computes the same numbers, rather than
  re-implementing them.
- **Administration → Organization** models the hierarchy
  `Company → Branch → Department → Team → Employees`. Any module that
  needs org structure (headcount by department, team rosters) should read
  this hierarchy rather than maintaining its own copy.
