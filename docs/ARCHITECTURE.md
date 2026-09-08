# OctoSphere — Architecture

OctoSphere is an Enterprise Employee Workplace Platform: HRMS + Workforce
Management + Task Management + Internal Service Desk + Analytics, built
incrementally across many sessions. This document is the source of truth
for how the codebase is put together — read it, `CONVENTIONS.md`, and
`MODULE_PLAN.md` before writing code in this repo, in any session.

## Status

This session ("Part 1 — Project Constitution") is the foundation: a
monorepo with a Django backend and a React frontend, the application
shell (icon rail + sidebar + header) reused by every module, one real
module page (HRMS Overview) proving the widget pattern, and the `core`
Django app modeling the pieces every module depends on. Everything else —
full HRMS, My Work, Service Desk, Reports & Analytics, Administration — is
scaffolding (a route that resolves to "coming soon") until a later session
builds it. See `MODULE_PLAN.md` for exact status per module.

A prior session had built a frontend-only prototype (no backend, a
different shell shape) directly at the repo root. That prototype is
superseded by this session, not layered under it — the repo root now
holds only the monorepo split described below.

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
| Tabular/list views | AG-Grid (`ag-grid-community` + `ag-grid-react`) | Specified requirement — installed and pinned this session even though no list view exists yet (Employee List etc. are next session); see CONVENTIONS.md for the column-def pattern to follow once one is built |
| Charts | Recharts | Donut chart (`DonutCard`) and KPI sparklines (`KpiCard`) |
| Icons | lucide-react | Specified requirement; exact icon names are pinned in `frontend/src/shell/nav.config.ts` |

No server-state library (React Query, SWR, etc.) is wired in yet — there's
one real endpoint and the frontend doesn't consume it for data (only for
the sidebar's connectivity indicator). Add one when a module's first real
data-fetching page needs it, rather than pre-installing it now.

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

`POST /api/auth/token/` and `POST /api/auth/token/refresh/` exist
(`config/urls.py`) but nothing in the frontend calls them yet — no login
screen this session. `core.User` (see below) is the model they'll
authenticate against.

## Backend: app structure

```
backend/
  config/            Project package: settings, root urls, wsgi/asgi
  core/              The one shared app everything else depends on
    models/          One file per concern (see below), re-exported from models/__init__.py
    admin.py
    views.py          HealthCheckView — the only view this session
    urls.py
    tests.py
```

Every future module is its own Django app (`hrms/`, `my_work/`,
`service_desk/`, `reports/`, `administration/`) at `backend/` top level,
each depending on `core` and never the other way around — `core` has no
knowledge of any module-specific app. Wire a new app into
`config/settings.py: INSTALLED_APPS` and `config/urls.py` the same way
`core` is wired in.

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
  lib/               Cross-cutting: api.ts (fetch wrapper), currentUser.ts, formatters.ts
  shell/             App chrome, built once, reused by every module
    AppShell.tsx        Three-column layout: IconRail + Sidebar + (Header above content)
    IconRail.tsx         5 module icon buttons + wordmark (not a nav item)
    Sidebar.tsx           Collapsible, labeled sub-nav for the active module
    Header.tsx             Search, scope dropdown, avatar, directory/help/bell shortcuts, wordmark
    PageHeader.tsx          Reused by every module Overview: title + scope/filter dropdown
    nav.config.ts            The 5 modules + their sidebar sub-nav (drives IconRail, Sidebar, routes.tsx)
  widgets/           Reusable dashboard widgets, composed differently per module
    KpiCard.tsx, DonutCard.tsx, MiniCalendarCard.tsx, ActivityFeedCard.tsx
  common/            Generic pages/components not specific to one module
    ComingSoonPage.tsx
  modules/
    hrms/
      HrmsOverviewPage.tsx
      mockData.ts
    (my-work/, service-desk/, reports/, administration/ don't exist as folders yet —
     they have nothing but a ComingSoonPage behind their nav.config.ts entries)
```

A future module's folder mirrors `modules/hrms/`: its own page
component(s) + its own `mockData.ts` (or, once its backend exists, a
`data/use<Feature>.ts` hook that wraps a real `lib/api.ts` call instead of
returning mock data — see CONVENTIONS.md's mock-to-real seam).

### Routing shape

One dynamic route, `/:moduleId/:pageId`, resolved by `routes.tsx`'s
`ModulePage`: look up `moduleId` in `nav.config.ts`, and if
`moduleId === 'hrms' && pageId === 'overview'` render the real
`HrmsOverviewPage`, otherwise render `ComingSoonPage`. Adding a second
real page is one more condition in that same function — the routing shape
doesn't change as more modules get built.

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

`modules/hrms/mockData.ts` is the only data source behind
`HrmsOverviewPage` this session — there's no `hrms` Django app yet, so
there's nothing to fetch. `HrmsOverviewPage` doesn't import `mockData.ts`
values in a way that's hard to unwind: once a real `/api/hrms/overview/`
endpoint exists, the plan is a `data/useHrmsOverview.ts` hook (see
`useExecutiveOverview`-style wrapping in a prior session's convention,
same idea here) that calls `lib/api.ts` instead of returning
`mockData.ts` — the page component itself shouldn't need to change.

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

## Forward-looking notes for modules not yet built

- **HRMS**: build `HRMS.EmployeeProfile` (OneToOne → `core.User`) for the
  rich "My Profile" fields rather than growing `core.User` further. Reuse
  `core.Company/Branch/Department/Team` for org structure — don't
  re-model it. Employee List is the first AG-Grid table — see
  CONVENTIONS.md for the column-def convention to start with.
- **Service Desk**: build ticket creation/assignment flows *on*
  `core.Ticket`/`SLAPolicy` — don't create per-desk models. Each of the 3
  desk "views" (`/service-desk/hr-desk` etc.) should be the same list
  view filtered by `desk`, not 3 different pages with duplicated logic.
- **Reports & Analytics**: once module dashboards exist, cross-module
  aggregations (e.g. an Executive Reports page) should query `core`
  models directly or via a small shared aggregation module, not duplicate
  a query another module already wrote.
- **Administration**: Organization CRUD operates on
  `core.Company/Branch/Department/Team`; User Management on `core.User`.
  Both already exist — this module is UI + permissions on top of them,
  not new data modeling.
- **My Work**: Approvals is a UI on top of `core.ApprovalRequest`; don't
  build a parallel approval table.
