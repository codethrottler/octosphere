# OctoSphere — Module Plan

Tracks what's built vs. planned, broken into buildable increments per
module. Update this file in the same commit that changes a module's
status — it should always reflect the actual state of `main`, not intent.

Status legend: ✅ done · 🚧 partial · ⬜ not started.

## Foundation (Part 1 — this session) — ✅

Not a "module" in the nav tree, but the prerequisite everything else is
built on:

- [x] Monorepo layout (`/backend`, `/frontend`), each with its own
      dependency manifest and `.env.example`.
- [x] Django + DRF + MySQL backend, `core` app with migrations applied
      against a real MySQL database (not sqlite).
- [x] JWT auth wired (`djangorestframework-simplejwt`) — token endpoints
      exist, no login screen consumes them yet.
- [x] `GET /api/core/health/` — public, reports DB connectivity. Consumed
      by the frontend Sidebar's "API connected" indicator, not just curl.
- [x] Application shell: `AppShell`, `IconRail` (5 modules), `Sidebar`
      (collapsible, per-module sub-nav), `Header` (search, org/branch
      scope, avatar, directory/help/notifications shortcuts, wordmark).
- [x] Widget library: `KpiCard` (with sparkline), `DonutCard`,
      `MiniCalendarCard`, `ActivityFeedCard`.
- [x] Routing shape (`/:moduleId/:pageId`) that every module's pages will
      slot into without changing its shape.
- [x] `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, this file, README,
      `.env.example` × 2, pinned `requirements.txt` / `package.json`.

## Shared/foundation additions (Part 2)

Built while implementing HRMS, but reusable by every future module —
listed here so the next session doesn't rebuild them:

- `src/auth/` — `AuthContext`/`useAuth()`, `LoginPage`, `ProtectedRoute`.
  Every module now sits behind a real JWT session; `lib/currentUser.ts`
  (the Part 1 static mock) is gone.
- `lib/api.ts` gained `apiPost`/`apiPatch`/`apiPut`/`apiDelete`/`apiUpload`
  (was GET-only) and a 401 → auto-logout event.
- `core/approvals.py` — `create_approval_request`/`get_approval_request`/
  `decide_approval_request`. Any future module needing a yes/no decision
  (My Work's Approvals, a Service Desk ticket escalation) should use
  this, not build its own.
- `GET /api/core/me/` — the authenticated user's identity.
- AG-Grid is live: `widgets/gridDefaults.ts` (theme + module
  registration) and `widgets/gridDatasource.ts` (Infinite Row Model ↔
  DRF limit/offset bridge). `hrms/pagination.py`'s `GridPagination` is
  the backend half — apply both to any future AG-Grid-backed list.
- `widgets/SubTabs.tsx` and `widgets/Badge.tsx` — new shared primitives,
  each justified by 2–3x reuse within HRMS already (Employees/
  Attendance/Leave sub-tabs; correction/leave approval status pills).
- `.input` utility class in `index.css` for form fields.

## 👥 HRMS

- [x] **Overview** (`/hrms/overview`) — KPI grid (headcount, new
      joiners, exits, attendance rate, all via a period filter),
      department distribution donut, HR calendar, recent activity feed.
      **Real data** as of Part 2: `GET /api/hrms/overview/?period=`
      (`backend/hrms/views/overview.py`) via
      `frontend/src/modules/hrms/data/useHrmsOverview.ts`. See that
      view's docstring for exactly which KPIs are real trends vs.
      documented flat snapshots (no headcount-history table exists to
      chart Total/Active Employees or Exits over time).
- [x] Backend: `hrms` Django app — `EmployeeProfile` (OneToOne →
      `core.User`), `Designation`/`Skill` catalogs, `AttendanceRecord`/
      `AttendanceCorrection`, `LeaveType`/`LeaveBalance`/`LeaveRequest`.
      `core.User` untouched. `core/approvals.py` (new in Part 2) is the
      generic helper both `AttendanceCorrection` and `LeaveRequest`
      approvals go through — neither has its own status field, see
      ARCHITECTURE.md's generic-FK pattern.
- [x] **My Profile** (`/hrms/my-profile`) — Personal/Contact tabs
      editable; Employment read-only (HR-managed, cross-references
      `core.User` via `useAuth()`); Emergency Contacts, Bank/Payment
      (India-specific: account number + IFSC), Skills & Qualifications,
      Documents (profile-scoped upload/list/delete) all with real
      add/delete against the backend.
- [x] **Employees** (`/hrms/employees`) — Directory (card grid), List
      (**the first AG-Grid table** — server-side search/filter/sort via
      `widgets/gridDatasource.ts`'s Infinite Row Model), Org Structure
      (Company→Branch→Department→Team tree), Departments, Designations,
      Teams (all read-only browses on `core` org models). Managers and
      Employee Lifecycle (onboarding/transfers/promotions/probation/
      offboarding) are **not built** — no UI for creating/editing
      employees exists yet, by design (that's onboarding, a future
      session).
- [x] **Attendance** (`/hrms/attendance`) — My Attendance (Check In/Check
      Out actions + AG-Grid list), Team Attendance (same grid,
      `?scope=team` = my direct reports), Attendance Calendar
      (`MiniCalendarCard` reused), Corrections (request + manager
      approve/reject, applies the correction to the record on approval).
      Late/Early Records, Overtime, Shift Management, and Attendance
      Reports are **not built** — no shift model exists, so "late" isn't
      computable yet.
- [x] **Leave** (`/hrms/leave`) — Apply Leave (form + AG-Grid of my
      requests), Leave Balance (per-type cards), Leave Calendar
      (`MiniCalendarCard`, date-range-expanded highlights), Approvals
      (my direct reports' pending requests, approve/reject — decrements
      the matching `LeaveBalance` server-side on approval).
      `LeaveType` is a real admin-configurable table (Django admin),
      not a hardcoded enum. Leave Reports is **not built**.
- [ ] Documents (My/Employee/Company, Policies, Contracts, Certificates,
      Expiry, Approval) — still out of scope; only Profile Documents
      (above) exists
- [ ] Performance (My/Goals/KPIs/Reviews/Manager Reviews/Self
      Assessment/Feedback/Reports)
- [ ] HR Administration (Employee/Leave/Attendance policies, Holiday
      Calendar, HR Settings) — `LeaveType` is admin-editable via Django
      admin today; no in-app UI for it or any other policy yet

## ✅ My Work

- [ ] Overview (`/my-work/overview`) — currently `ComingSoonPage`
- [ ] My Tasks (All/Assigned/Created/Due Today/Upcoming/Overdue/Completed)
- [ ] Projects (All/My/Team, Dashboard, Milestones, Reports)
- [ ] Approvals (Pending/Approved/Rejected/History) — UI on
      `core.ApprovalRequest`
- [ ] Team Work (Tasks/Workload/Performance/Calendar)
- [ ] My Calendar (Tasks/Meetings/Leave/Deadlines/Events)
- [ ] Backend: `my_work` Django app — `Task`, `Project` models; tasks
      should be notifiable/auditable via `core.Notification`/`AuditLogEntry`
      generic FKs, not their own copies

## 🎫 Service Desk

- [ ] Overview (`/service-desk/overview`) — currently `ComingSoonPage`
- [ ] HR Desk / IT & Network Desk / Admin Desk — **must** be the same
      list view filtered by `Ticket.desk`, not 3 separate pages. See
      ARCHITECTURE.md "Ticket engine: one model family, not three" — this
      is a hard constraint, not a suggestion.
- [ ] Ticket Management (All/Unassigned/Assigned to Me/Escalated/SLA
      Breached/Closed) — built on `core.Ticket`/`SLAPolicy`, already
      modeled
- [ ] Knowledge Base (FAQs, HR/IT/Admin Articles, Policies & Guides)
- [ ] Service Reports (Volume/SLA/Resolution/Agent/Department Performance)
- [ ] Backend: ticket creation/assignment flow that actually populates
      `sla_due_at` from `SLAPolicy` and flips `sla_breached` — the models
      exist (`core.Ticket`, `SLAPolicy`), the engine that drives them
      doesn't yet

## 📊 Reports & Analytics

- [ ] Overview (`/reports/overview`) — currently `ComingSoonPage`
- [ ] Executive Reports, HR Analytics, Workforce Analytics, Task &
      Productivity, Service Desk Analytics, Custom Reports, Scheduled
      Reports, Export Center
- [ ] Once module dashboards exist elsewhere, cross-module aggregations
      here should query `core` models directly / via a shared aggregation
      module — not duplicate a query another module's Overview already
      wrote (see ARCHITECTURE.md)

## ⚙️ Administration

- [ ] Overview (`/administration/overview`) — currently `ComingSoonPage`
- [ ] Organization — CRUD on `core.Company/Branch/Department/Team`
      (already modeled)
- [ ] User Management (Users/Roles/Permissions/Groups/Access Control) —
      CRUD + permission logic on `core.User` (already modeled; no
      role/permission model exists yet beyond Django's built-in
      `auth.Group`/`Permission` — decide whether that's sufficient or a
      custom `Role` model is needed when this is built)
- [ ] Workflow Management, Service Desk Configuration (Desks, Categories,
      Priorities, SLA Policies — UI on `core.SLAPolicy`, Escalation
      Rules, Ticket Statuses)
- [ ] Notifications (Email Templates, Rules, In-App, Preferences) — UI on
      `core.Notification`
- [ ] System Settings, Security, Audit & Compliance (UI on
      `core.AuditLogEntry`), System Monitoring

## Header bell → Notifications

The header's notification bell (`MOCK_UNREAD_NOTIFICATIONS = 5` in
`Header.tsx`) links to `/administration/notifications`, which doesn't
exist as a real page yet — it resolves to `ComingSoonPage` until
Administration → Notifications is built. Swap the mock constant for a
real unread count (`core.Notification.objects.filter(recipient=request.user,
is_read=False).count()` via a small endpoint) at the same time.
