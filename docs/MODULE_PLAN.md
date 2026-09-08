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

## 👥 HRMS

- [x] **Overview** (`/hrms/overview`) — KPI grid (headcount, new
      joiners, exits, attendance rate, all via a period filter),
      department distribution donut, HR calendar, recent activity feed.
      Mock data (`frontend/src/modules/hrms/mockData.ts`).
- [ ] Backend: `hrms` Django app — `EmployeeProfile` (OneToOne →
      `core.User`) for the rich profile fields (emergency contacts, bank
      details, skills, documents). Don't grow `core.User` further — see
      ARCHITECTURE.md.
- [ ] My Profile (personal/contact/employment/emergency/bank/skills/documents)
- [ ] Employees (Directory, List — **first AG-Grid table**, Org
      Structure, Departments, Designations, Teams, Managers, Lifecycle:
      onboarding/transfers/promotions/probation/offboarding)
- [ ] Attendance (My/Team, calendar, check in/out, late/early, overtime,
      shifts, corrections, reports)
- [ ] Leave (My/Apply/Balance/Calendar/Team/Approvals/Types/Reports) —
      Approvals here should be a UI on `core.ApprovalRequest`, not a new
      approval table
- [ ] Documents (My/Employee/Company, Policies, Contracts, Certificates,
      Expiry, Approval)
- [ ] Performance (My/Goals/KPIs/Reviews/Manager Reviews/Self
      Assessment/Feedback/Reports)
- [ ] HR Administration (Employee/Leave/Attendance policies, Holiday
      Calendar, HR Settings)

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
