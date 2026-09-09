# OctoSphere — Architecture

OctoSphere is an Enterprise Employee Workplace Platform: HRMS + Workforce
Management + Task Management + Internal Service Desk + Analytics, built
incrementally across many sessions. This document is the source of truth
for how the codebase is put together — read it, `CONVENTIONS.md`, and
`MODULE_PLAN.md` before writing code in this repo, in any session.

## Status

**Part 1 ("Project Constitution")** built the foundation: the monorepo,
the application shell (icon rail + sidebar + header) reused by every
module, the widget library, the `core` Django app modeling the pieces
every module depends on, and one real page (HRMS Overview) proving the
pattern — on mock data at the time.

**Part 2** built HRMS's first four sub-areas end to end (My Profile,
Employees, Attendance, Leave — see `MODULE_PLAN.md`) with real
models/APIs, added the JWT login flow that Part 1 deliberately deferred,
brought AG-Grid from "installed" to "in use," and wired HRMS Overview to
real data (mock data was always meant to be a small-diff placeholder —
see "Data & the mock-to-real seam" below). Everything else — My Work,
Service Desk, Reports & Analytics, Administration, and the rest of HRMS
(Documents, Performance, HR Administration) — is still scaffolding (a
route that resolves to "coming soon"). See `MODULE_PLAN.md` for exact
status per module.

A prior session had built a frontend-only prototype (no backend, a
different shell shape) directly at the repo root, before Part 1. That
prototype was superseded by Part 1, not layered under it.

## Repository layout

```
/
  backend/     Django + DRF, MySQL
  frontend/    React (Vite) + Tailwind CSS
  docs/        This file, CONVENTIONS.md, MODULE_PLAN.md
```

Each half has its own dependency manifest (`backend/requirements.txt`,
`frontend/package.json`) and its own `.env` (see each folder's
`.env.example`). They are developed and run independently — see the
README for exact commands — and talk to each other only over HTTP
(`frontend` calls `backend`'s REST API; nothing imports across the
boundary).

## Stack

| Concern | Choice | Why |
|---|---|---|
| Backend | Django 5.1 + Django REST Framework | Batteries-included ORM/admin/migrations for a data-heavy enterprise app; DRF is the standard REST layer on top |
| Database | MySQL 8 | Specified requirement. `django.db.backends.mysql` via `mysqlclient` (Django's recommended driver — more thoroughly exercised against Django's MySQL backend than PyMySQL) |
| Auth | JWT (`djangorestframework-simplejwt`) | See "Auth" below |
| Frontend | React 19 + TypeScript, built with Vite | Fast dev loop, standard for a React SPA |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme` tokens) | No separate config file to keep in sync; design tokens live in `frontend/src/index.css` |
| Tabular/list views | AG-Grid (`ag-grid-community` + `ag-grid-react`) | Specified requirement. In use since Part 2 (Employee List, Attendance records, Leave requests) via the Infinite Row Model — see "AG-Grid: server-side pagination" below |
| Charts | Recharts | Donut chart (`DonutCard`) and KPI sparklines (`KpiCard`) |
| Icons | lucide-react | Specified requirement; exact icon names are pinned in `frontend/src/shell/nav.config.ts` |

No server-state library (React Query, SWR, etc.) is wired in yet. Every
data-fetching hook so far (`useHrmsOverview`, the per-sub-area `data.ts`
files) is a plain `useEffect` + `useState` — that's held up fine through
Part 2's 4 sub-areas; revisit if manual cache invalidation across them
gets genuinely painful, not preemptively.

## Auth: JWT, not Django sessions

`djangorestframework-simplejwt` — access + refresh tokens, `Bearer` auth
header, no `SessionAuthentication` in `REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES`.

Why JWT over Django sessions:
- The frontend is a separate SPA origin in dev (`localhost:5173` →
  `localhost:8000`) and potentially a separate deployed origin in
  production. Session auth needs cookies + CSRF token plumbing across
  that boundary; JWT in an `Authorization` header sidesteps it entirely.
- A platform with an internal Service Desk and HRMS is a plausible future
  mobile-client candidate. A token-based API doesn't need a second auth
  scheme bolted on later.
- Django's session/cookie auth remains available for the Django **admin**
  site (`/admin/`) — that's unrelated to the API and untouched by this
  choice.

Trade-off accepted: JWTs can't be server-side revoked before they expire
(hence a deliberately short `ACCESS_TOKEN_LIFETIME`, default 30 minutes,
with rotating refresh tokens — see `backend/.env.example`). Fine for this
platform's threat model; revisit if a "log out everywhere" requirement
appears.

`POST /api/auth/token/` and `POST /api/auth/token/refresh/`
(`config/urls.py`) authenticate against `core.User`. `frontend/src/auth/`
(added Part 2) is the consumer: `AuthContext`/`useAuth()` loads the
session on mount if a token is stored, `LoginPage` calls
`requestTokenPair`, and `ProtectedRoute` gates the whole shell behind it.
Refresh-token rotation exists server-side but nothing calls
`/token/refresh/` yet — a 401 anywhere just logs the user out (see
`lib/api.ts`'s `AUTH_EVENTS`) rather than silently retrying with a
refreshed token. Implement that once session length in practice makes
"just log back in" annoying, not speculatively.

## Backend: app structure

```
backend/
  config/            Project package: settings, root urls, wsgi/asgi
  core/              The one shared app everything else depends on
    models/          One file per concern (see below), re-exported from models/__init__.py
    approvals.py      Generic ApprovalRequest helpers (Part 2) — hrms builds leave/attendance approvals on this
    admin.py
    serializers.py, views.py    CurrentUserSerializer/CurrentUserView (GET /api/core/me/), HealthCheckView
    urls.py
    tests.py
  hrms/              First module app (Part 2) — the template for my_work/service_desk/reports/administration
    models/          profile.py, catalog.py, attendance.py, leave.py — one file per concern, same as core
    serializers/, views/    Same per-concern split as models/, once an app has enough endpoints to warrant it
    permissions.py    IsProfileOwnerOrStaff etc. — "HR/admin" gates on is_staff, no Role model exists yet
    pagination.py      GridPagination (limit/offset) for the 3 AG-Grid-backed list endpoints
    filters.py          apply_ordering() — whitelist-based, not a filter library
    management/commands/seed_demo_data.py    Idempotent demo data — run it on a fresh clone
    urls.py, admin.py, tests.py
```

Every module is its own Django app (`hrms/`, `my_work/`, `service_desk/`,
`reports/`, `administration/`) at `backend/` top level, each depending on
`core` and never the other way around — `core` has no knowledge of any
module-specific app. Wire a new app into `config/settings.py:
INSTALLED_APPS` and `config/urls.py` the same way `core`/`hrms` are wired
in. `hrms/` is the reference to copy the shape of, not `core/` — a real
module app has serializers/views/permissions/pagination that `core`
(with exactly one simple view) never needed.

### `core` app — what's in it and why it's shared

Everything in `core` is here because more than one future module needs
it, or because the Service Desk's 3 desks explicitly require it to be one
system, not three:

- **`core.User`** (`AUTH_USER_MODEL`) — extends `AbstractUser`. The single
  identity used everywhere: HRMS employee, ticket requester/assignee,
  approval requester/approver, audit actor. Deliberately lean this
  session — `employee_code`, `title`, `team`, `manager` (self-FK),
  `employment_status`, `date_joined_company`. Full HRMS profile fields
  (emergency contacts, bank details, documents — see the nav tree's "My
  Profile") are NOT here; that's the HRMS module's job next session,
  probably as a `HRMS.EmployeeProfile` OneToOne onto `core.User` rather
  than more columns bolted onto `User` itself.
- **`core.Company` / `Branch` / `Department` / `Team`** — the org
  hierarchy (`Company → Branch → Department → Team → Employees`),
  strictly nested via FK. `core.User.team` is how an employee attaches to
  it. Any module needing org structure reads this; nothing duplicates it.
- **Ticket engine** (`core.Ticket`, `TicketComment`, `TicketAttachment`) —
  see the dedicated section below.
- **`core.SLAPolicy`** — one (desk, priority) → (response time,
  resolution time) policy table. `Ticket.sla_due_at` /
  `Ticket.sla_breached` are the per-ticket fields the Service Desk module
  will compute from it; that computation logic isn't built yet (no
  ticket-creation flow exists to trigger it from).
- **`core.Notification`** — one notification model for the whole
  platform, with a generic FK (`content_type` + `object_id`) at `target`
  so a notification can point at a `Ticket` today and a `Task` or
  `ApprovalRequest` once those exist, without a new notification table
  per module.
- **`core.AuditLogEntry`** — one append-only audit trail, same generic-FK
  shape as `Notification`. Every module logs into this table instead of
  keeping its own history table.
- **`core.ApprovalRequest`** — a generic single-step approval
  (requester → approver → approve/reject), pointed at *any* model via the
  same generic-FK pattern. This is the primitive "Approvals" (My Work) and
  leave/expense approval flows sit on top of. Multi-step workflow chains
  (a `WorkflowDefinition`/`WorkflowStep` pair) are a deliberate
  non-decision: nothing yet needs more than one approval step, so building
  that shape now would be speculative. Add it when a real multi-step case
  shows up, on top of this table rather than replacing it.

### Ticket engine: one model family, not three

The nav tree shows 3 desks (HR, IT & Network, Admin) as if they were 3
separate systems. They are **one** `core.Ticket` model, discriminated by
a `desk` field (`Desk.HR` / `Desk.IT` / `Desk.ADMIN`) — not
`HRTicket`/`ITTicket`/`AdminTicket` tables. This is the explicit design
priority from the brief, and it's what the SLA engine, notification
system, audit system, comment system (`TicketComment`), and attachment
system (`TicketAttachment`) are built to serve uniformly: they all key off
`Ticket`, so there's exactly one implementation of "add a comment to a
ticket" or "compute this ticket's SLA," not three.

Desk-specific structured data (an IT ticket's asset tag, an HR ticket's
leave type) goes in `Ticket.extra` (a `JSONField`), not in desk-specific
columns or desk-specific tables. If a desk-specific field needs to be
queried/filtered on heavily, promote it to a real column at that point —
don't promote speculatively.

What genuinely differs per desk (which categories show in a dropdown,
which SLA policy applies, which agents can be assigned) is *configuration*
— rows in `SLAPolicy` filtered by `desk`, and (once built) a desk→category
config table in the Service Desk module — not separate code paths.

### Generic-FK pattern

`Notification`, `AuditLogEntry`, and `ApprovalRequest` all use Django's
`contenttypes` generic FK (`content_type` + `object_id` → `target`) to
point at *any* model. This is the mechanism that lets these 3 core systems
serve every future module without each module needing its own
notification/audit/approval table. When a module adds a model that should
be notifiable/auditable/approvable, it doesn't add fields to that
model — it just creates `Notification`/`AuditLogEntry`/`ApprovalRequest`
rows pointed at it.

## Frontend: folder structure

```
frontend/src/
  main.tsx, App.tsx, routes.tsx, index.css, vite-env.d.ts
  auth/              Session, new in Part 2 — not shell chrome, not a widget, not one module's content
    AuthContext.tsx     useAuth(): session state, login()/logout(), auto-logout on 401
    authApi.ts           requestTokenPair, fetchCurrentUser — the only fetch calls in this folder
    LoginPage.tsx          Rendered by ProtectedRoute when unauthenticated
    ProtectedRoute.tsx      Gates AppShell+AppRoutes behind a session
  lib/               Cross-cutting: api.ts (fetch wrapper), formatters.ts
  shell/             App chrome, built once, reused by every module
    AppShell.tsx        Three-column layout: IconRail + Sidebar + (Header above content)
    IconRail.tsx         5 module icon buttons + wordmark (not a nav item)
    Sidebar.tsx           Collapsible, labeled sub-nav for the active module
    Header.tsx             Search, scope dropdown, avatar (useAuth()), directory/help/bell/sign-out, wordmark
    PageHeader.tsx          Reused by every module Overview: title + scope/filter dropdown
    nav.config.ts            The 5 modules + their sidebar sub-nav (drives IconRail, Sidebar, routes.tsx)
  widgets/           Reusable across modules, composed differently per screen
    KpiCard.tsx, DonutCard.tsx, MiniCalendarCard.tsx, ActivityFeedCard.tsx   Part 1
    SubTabs.tsx, Badge.tsx, gridDefaults.ts, gridDatasource.ts               Part 2 — see below
  common/            Generic pages/components not specific to one module
    ComingSoonPage.tsx
  modules/
    hrms/
      HrmsOverviewPage.tsx
      data/useHrmsOverview.ts          Real data since Part 2 — mockData.ts is gone
      profile/    employees/    attendance/    leave/     One sub-folder per HRMS sub-area (Part 2) —
                                                            each has its own data.ts/types.ts + page + tab components
    (my-work/, service-desk/, reports/, administration/ don't exist as folders yet —
     they have nothing but a ComingSoonPage behind their nav.config.ts entries)
```

A module large enough to have multiple sub-areas (HRMS does: Profile,
Employees, Attendance, Leave) gets one sub-folder per sub-area rather
than one flat `modules/hrms/` full of same-named files — `data.ts` means
something different in `modules/hrms/profile/` vs
`modules/hrms/attendance/`, so the folder boundary carries that context
instead of a naming prefix. A smaller module can stay flat, the way
`modules/hrms/` itself is for `HrmsOverviewPage.tsx` + `data/`.

### AG-Grid: server-side pagination

Every list/table view (Employee List, Attendance records, Leave
requests) uses AG-Grid's **Infinite Row Model** — the Community-tier row
model, not the Enterprise-only Server-Side Row Model, which "server-side
pagination" more naturally suggests. `widgets/gridDatasource.ts`'s
`createInfiniteDatasource()` bridges it to a DRF endpoint:
`startRow`/`endRow` become `offset`/`limit`, and the grid's (single-
column) `sortModel` becomes a DRF `ordering` string. The matching backend
piece is `hrms/pagination.py`'s `GridPagination`
(`LimitOffsetPagination`, not the project's default `PageNumberPagination`
— only these 3 endpoints need limit/offset semantics; everything else
keeps the default). A column's `field` doubles as the sort `colId` sent
to the backend, so it must match a name the view's `apply_ordering()`
whitelist recognizes (`hrms/filters.py`) or sorting that column silently
no-ops server-side.

Filtering is NOT done via AG-Grid's built-in column filter popovers
(`defaultColDef.filter` is `false` in `gridDefaults.ts`) — each grid has
its own explicit filter UI (search box, dropdowns) that builds query
params passed into the datasource's `fetchPage` closure. This keeps the
filter set intentionally small and explicit rather than trying to
generically translate AG-Grid's full filter model into DRF query params.

### Routing shape

One dynamic route, `/:moduleId/:pageId`, resolved by `routes.tsx`'s
`ModulePage` against a `PAGE_REGISTRY` map (`"hrms/overview"` →
`HrmsOverviewPage`, etc.) — anything not in the map renders
`ComingSoonPage`. Adding a real page is one more map entry; the routing
shape doesn't change as more modules get built.

`/`, and `/:moduleId` alone, redirect to `/:moduleId/overview` — every
module's sidebar gets an "Overview" as its first item (its dashboard
landing page), even though only `hrms/overview` has real content yet.

**Important, and easy to get wrong again:** `Sidebar` and `IconRail` are
both rendered by `AppShell` as *siblings* of `<Routes>` (`AppShell` wraps
`{children}`, where `{children}` is `<AppRoutes/>`), not as descendants of
the matched `<Route>`'s element. That means `useParams()` inside `Sidebar`
or `IconRail` does **not** see `:moduleId`/`:pageId` — there's no Route
context available at that point in the tree. Both derive the active
module from `useLocation().pathname` instead (`moduleNav.find(m =>
location.pathname.startsWith(m.path))`). This bit an early version of
`Sidebar` (it used `useParams` and silently always showed HRMS's nav on
every module) — keep using `useLocation` for any future shell chrome that
needs to know "what page are we on."

## The Dashboard widget pattern

`KpiCard` / `DonutCard` / `MiniCalendarCard` / `ActivityFeedCard`
(`frontend/src/widgets/`) are the 4 primitives every module's Overview
page composes, per the mockup: a 2-column KPI grid (label, big number,
trend sparkline), a donut/pie breakdown, a mini month calendar, and a
full-height activity feed. `HrmsOverviewPage` is the reference
implementation — a future module's Overview page should look like a
different data set poured into the same 4 components, not a new set of
one-off widgets. Only add a 5th widget when a module's Overview genuinely
needs a different *interaction shape*, not just different data — and say
why in a comment on the new component, the way the shell components do.

## Data & the mock-to-real seam

Proven out in Part 2, not just planned: `modules/hrms/mockData.ts` was
Part 1's only data source behind `HrmsOverviewPage`. Once
`GET /api/hrms/overview/` existed, `data/useHrmsOverview.ts` replaced it
and `HrmsOverviewPage.tsx` changed only to add a loading state — its JSX
was otherwise untouched. Follow the same shape for any module still on
mock data: a `use<Feature>()` hook with the same return shape the mock
had, swapped in at the one import site.

## How the frontend calls the API

`frontend/src/lib/api.ts` is the only place that calls `fetch` against the
backend. `apiGet<T>(path)` (and the underlying `apiRequest`) attach the
JWT access token from `localStorage` if present and throw `ApiError` on a
non-2xx response. No component calls `fetch` directly — see
CONVENTIONS.md.

`VITE_API_BASE_URL` (default `http://localhost:8000`, see
`frontend/.env.example`) is the only environment-specific piece;
`CORS_ALLOWED_ORIGINS` on the backend (`backend/.env.example`) must
include the frontend's origin for this to work in the browser.

## A gotcha worth generalizing: approve/reject actions and get_queryset()

Both `LeaveRequestViewSet.approve/reject` and
`AttendanceCorrectionViewSet.approve/reject` (Part 2) 404'd for a
legitimate approving manager before this fix, because their custom
actions called `self.get_object()`, which runs against the *same*
`get_queryset()` used for `list` — scoped to "things I own" or "my
team." A manager approving a report's request is neither; the object
lookup failed before the approval logic even ran. Fixed by having
`get_queryset()` skip that scoping when `self.action in ("approve",
"reject")` and relying on the explicit approver check inside the action
instead. Any future module adding an approve/reject-style action on a
scoped queryset (My Work's Approvals, a Service Desk escalation) will hit
the same thing — check `self.action` in `get_queryset()`, don't assume
the list scoping is safe to reuse for object-level actions.

## Forward-looking notes for modules not yet built

- **HRMS**: My Profile/Employees/Attendance/Leave are built (Part 2) —
  see `MODULE_PLAN.md`. Still open: Documents (beyond profile
  documents), Performance, HR Administration (an in-app UI for
  `LeaveType` etc. — it's Django-admin-only today), and Employee
  Lifecycle (onboarding/transfers/promotions/probation/offboarding —
  there's still no create/edit-employee UI anywhere).
- **Service Desk**: build ticket creation/assignment flows *on*
  `core.Ticket`/`SLAPolicy` — don't create per-desk models. Each of the 3
  desk "views" (`/service-desk/hr-desk` etc.) should be the same list
  view filtered by `desk`, not 3 different pages with duplicated logic.
  Its 3 list views (open tickets etc.) are AG-Grid candidates — reuse
  `widgets/gridDefaults.ts`/`gridDatasource.ts` and `hrms/pagination.py`'s
  `GridPagination` pattern (move `GridPagination`/`filters.py` to `core`
  if a second app needs the identical thing verbatim, rather than
  copy-pasting).
- **Reports & Analytics**: once module dashboards exist, cross-module
  aggregations (e.g. an Executive Reports page) should query `core`
  models directly or via a small shared aggregation module, not duplicate
  a query another module already wrote. `hrms/views/overview.py` is a
  worked example of one module's aggregation view.
- **Administration**: Organization CRUD operates on
  `core.Company/Branch/Department/Team`; User Management on `core.User`.
  Both already exist — this module is UI + permissions on top of them,
  not new data modeling. HRMS's Employees > Departments/Teams
  (read-only browses) are the reference for what Administration's
  Organization CRUD extends into an editable UI. This is also where a
  real `Role`/`Permission` model should land, if `is_staff` (what
  HRMS's permission checks use today — see `hrms/permissions.py`) turns
  out not to be enough.
- **My Work**: Approvals is a UI on top of `core.ApprovalRequest`; don't
  build a parallel approval table. `core/approvals.py` (Part 2) is the
  helper layer to use — see the generic-FK pattern above and HRMS's
  leave/attendance-correction approvals for a worked example of the
  pattern (open an approval on create, decide it via an approve/reject
  action, apply any domain-specific side effect after `decide_approval_request`).
