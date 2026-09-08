# OctoSphere — Module Plan

Tracks what's built vs. planned across the full nav tree. Update this file
in the same commit that changes a module's status — it should always
reflect the actual state of `main`, not intent.

Status legend: ✅ built this session · 🚧 partially built · ⬜ not started
(placeholder route only, or nothing at all).

## 🏠 Dashboard — ✅ built

The Unified Dashboard, one level above the 5 module icons. Lives at
`/dashboard`, entered via the "Home" icon-rail entry or the OctoSphere
wordmark. Sub-pages are tabs on this one route (`?tab=<id>`), not separate
routes — see `ARCHITECTURE.md` for why.

| Tab (`?tab=`) | Status | Notes |
|---|---|---|
| Executive Overview (`executive`) | ✅ | Cross-module KPIs via `shared/analytics/getExecutiveSummary()`. Reused as-is by Reports' future Executive Reports page. |
| My Overview (`my`) | ✅ | Personal snapshot. Mock data — swaps to real once My Work exists. |
| Team Overview (`team`) | ✅ | Gated to `manager`/`admin`. Mock data — swaps to real once Team Work exists. |
| HR Overview (`hr`) | ✅ | Gated to `hr`/`admin`. Uses `shared/analytics/getHrSummary()` — reused as-is by HRMS' future Overview page. |
| Task Overview (`task`) | ✅ | Shares `taskData.mock.ts` with Executive Overview so totals agree. Mock data — swaps to real once My Work/Projects exists. |
| Service Desk Overview (`service-desk`) | ✅ | Shares `ticketData.mock.ts` with Executive Overview. Mock data — swaps to real once Service Desk exists. |
| Notifications & Alerts (`notifications`) | ✅ | Filterable + paginated. Read/unread state shared with the header bell via `NotificationsProvider`. |

Notifications & Alerts and the tabs above notification/error handling
(HR/Team gates) are the load-bearing examples for a future module to copy:
role gating, a shared cross-module data source, and a full list screen
(filter + paginate + mark-read) all exist here first.

## 👥 HRMS — ⬜

Not started. When built:
- My Profile, Employees (directory/list/org structure/lifecycle),
  Attendance, Leave, Documents, Performance, HR Administration per the
  nav tree.
- Its own Overview widget set should call `shared/analytics/getHrSummary()`
  (already built) rather than re-deriving headcount/department numbers —
  see ARCHITECTURE.md's "Data & the mock-to-real seam".
- Org hierarchy (`Company → Branch → Department → Team → Employees`) is
  owned here; other modules read it, they don't duplicate it.

## ✅ My Work — ⬜

Not started (name collides with the ✅ status marker above — that's just
this doc's legend, not a comment on the module). When built:
- My Tasks, Projects, Approvals, Team Work, My Calendar per the nav tree.
- Dashboard's My Overview / Team Overview / Task Overview tabs currently
  read mock data isolated in `modules/dashboard/mock/`
  (`myOverview.mock.ts`, `teamOverview.mock.ts`) and
  `shared/analytics/taskData.mock.ts`. Point their `data/use*.ts` hooks at
  the real My Work data once it exists; the tab components shouldn't need
  to change.
- Approvals feeding the Notifications list (`category: 'approval'`) should
  come from here once it's real.

## 🎫 Service Desk — ⬜

Not started. When built, HR Desk / IT Desk / Admin Desk **must** share one
ticket engine, SLA engine, assignment system, notification system, comment
system, attachment system, audit system, workflow engine, and reporting
engine — see ARCHITECTURE.md. The three desks are a view/category over
shared ticket data, not three parallel systems.
- Dashboard's Service Desk Overview tab and Executive Overview's
  "Tickets by Desk" donut both currently read
  `shared/analytics/ticketData.mock.ts`. Point that one file's data at the
  real ticket engine (or replace it with a `getTicketSummary()` aggregation
  next to it, same pattern as `executiveMetrics.ts`) once Service Desk
  exists.

## 📊 Reports & Analytics — ⬜

Not started. When built:
- Executive Reports must call `shared/analytics/getExecutiveSummary()`
  (already built for the Dashboard's Executive Overview tab) instead of
  re-implementing the same headcount/task/ticket aggregation.
- HR Analytics, Task & Productivity, Service Desk Analytics sections can
  follow the same pattern: add a `get*Summary()` in `shared/analytics/` if
  a Dashboard tab already computes overlapping numbers, rather than each
  screen owning its own copy.

## ⚙️ Administration — ⬜

Not started. Organization (`Company → Branch → Department → Team →
Employees`), User Management, Workflow Management, Service Desk
Configuration, Notifications, System Settings, Security, Audit &
Compliance, System Monitoring per the nav tree — all placeholders for now.

## Shell & shared infrastructure — ✅ built this session

Built as prerequisites for the Dashboard, available to every future module:

- `AppShell` / `IconRail` / `TopBar` — the 6-entry icon rail (Home + 5
  modules) and top bar with the notification bell + current user.
- `SessionProvider` / `useSession()` — current user + `hasRole(...)`.
- `NotificationsProvider` / `useNotifications()` — shared read/unread
  notification state.
- Shared component library: `KpiCard`, `DonutCard`, `MiniCalendarCard`,
  `ActivityFeedCard`, `Badge`, `Tabs`, `PermissionGate`, `Pagination`.
- `shared/analytics/` — `getExecutiveSummary()`, `getHrSummary()`, and
  their mock sources (`orgData.mock.ts`, `taskData.mock.ts`,
  `ticketData.mock.ts`).
