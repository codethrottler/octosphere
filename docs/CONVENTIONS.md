# OctoSphere — Conventions

Concrete rules for how code is written, so different sessions/modules stay
consistent. See `ARCHITECTURE.md` for *why* the codebase is shaped this
way; this doc is the *how*.

## Naming

- **Django apps**: lowercase, singular-or-plural-as-reads-naturally
  (`core`, `hrms`, `service_desk` — underscore for multi-word since it's a
  Python package name). One app per module in the nav tree, all depending
  on `core`, never on each other.
- **Django models**: one file per concern under `<app>/models/`
  (`core/models/tickets.py`, not one giant `models.py`), re-exported from
  `<app>/models/__init__.py` so `from core.models import Ticket` keeps
  working regardless of which file it's actually defined in.
- **React components**: `PascalCase.tsx`, one component per file, named
  exports (`export function KpiCard(...)`), not default exports.
- **React hooks**: `camelCase.ts`, named `use*`.
- **Mock data**: `camelCase.mock.ts` for a single-purpose mock file (was
  the pattern in the prior session); `modules/<module>/mockData.ts` (one
  file, all of that module's Overview mock data) is also fine for a
  module with one dashboard page and a handful of widgets, like
  `modules/hrms/mockData.ts` this session. Switch to per-widget
  `.mock.ts` files once a module's mock data grows past "one screen's
  worth."
- **Config**: `camelCase.config.ts` for static lookup tables that aren't
  components/hooks/types (`nav.config.ts`).

## API URL structure & versioning

`/api/<app>/<resource>/` — no version prefix (`/api/v1/...`) yet. There's
one frontend consumer and nothing to version against; add `/api/v2/`
alongside `/api/` if/when a breaking change needs one, rather than
pre-versioning speculatively. `/api/core/health/` and
`/api/auth/token/(refresh/)?` are the only routes that exist so far
(`backend/config/urls.py`).

Each app's URLs live in `<app>/urls.py` with `app_name = "<app>"`,
included from `config/urls.py` as `path("api/<app>/", include("<app>.urls"))`.
Route names inside are namespaced automatically (`reverse("core:health")`).

## DRF serializer/viewset patterns

Not exercised yet beyond `HealthCheckView` (a plain `APIView`, not a
viewset — there's no model to CRUD). Once a real resource needs
endpoints:

- Prefer `ModelSerializer` over hand-written fields unless the shape
  genuinely diverges from the model.
- Prefer `ModelViewSet` + a router for standard CRUD; drop to `APIView`
  only for actions that aren't CRUD on one model (auth, health, bulk
  actions).
- A view that should skip the default `IsAuthenticated` (see below) sets
  `permission_classes = [AllowAny]` explicitly and says why in a
  docstring, the way `HealthCheckView` does — don't change the global
  default to make one endpoint public.

## Auth

`REST_FRAMEWORK.DEFAULT_PERMISSION_CLASSES` is `IsAuthenticated` and
`DEFAULT_AUTHENTICATION_CLASSES` is JWT-only (see ARCHITECTURE.md "Auth").
Every new endpoint is locked down by default; opt out per-view, not
globally.

## Django settings & secrets

All environment-specific values come from `backend/.env` (loaded via
`python-dotenv`; never committed — `backend/.env.example` documents every
key). Nothing in `settings.py` should hardcode a value that differs
between machines — add a new `.env` key + `.env.example` entry instead.

## React folder structure

See ARCHITECTURE.md's "Frontend: folder structure" for the full tree.
Summary of where new code goes:

- **Shell chrome** (anything about the app frame itself, not one module's
  content) → `frontend/src/shell/`.
- **A widget reusable across module Overview pages** → `frontend/src/widgets/`.
  Reuse the existing 4 before adding a 5th — see ARCHITECTURE.md's "The
  Dashboard widget pattern".
- **A generic page/component not specific to one module** (like
  `ComingSoonPage`) → `frontend/src/common/`.
- **Anything specific to one module** → `frontend/src/modules/<module-id>/`,
  where `<module-id>` matches that module's `id` in `nav.config.ts`
  (`hrms`, `my-work`, `service-desk`, `reports`, `administration`).
- **Cross-cutting utilities** (API client, formatters, the mock current
  user) → `frontend/src/lib/`.

Components are flat files directly in their folder (`widgets/KpiCard.tsx`),
not nested in a same-named subdirectory — deliberately simpler than a
`ComponentName/ComponentName.tsx` pattern since there's no per-component
co-located test/story file yet to justify the extra nesting.

## Component props & styling

- Props are an inline `interface <ComponentName>Props` directly above the
  component in the same file.
- Tailwind utility classes on the JSX; no CSS modules, no
  styled-components. `clsx` for conditional classes. Design tokens
  (colors, font) are defined once in `frontend/src/index.css` via
  Tailwind v4's `@theme` block — reach for an existing `--color-*` token
  before hardcoding a value.
- A widget takes its data as props; it does not fetch or import mock data
  itself. The page composing it (`HrmsOverviewPage`) owns getting the
  data and passing it down — this is what keeps `widgets/*` reusable
  across modules instead of coupled to one module's data shape.

## AG-Grid column-def organization

Not exercised yet (no list view built this session — see MODULE_PLAN.md).
When the first one is built (HRMS Employee List is the likely first):

- Column definitions live in that module's own file,
  `modules/<module>/<listName>.columns.ts`, exporting a typed
  `ColDef[]` — not inlined in the page component. This keeps the grid
  component itself generic and the column list reviewable on its own.
- Reuse one grid options object (`frontend/src/widgets/gridDefaults.ts`,
  not created yet) for cross-list defaults (row height, pagination page
  size, default column resizing behavior) so every list in the app feels
  the same — add it when the second list view is built, not
  speculatively for the first.

## State management

- Local component state (`useState`) for anything scoped to one page —
  e.g. `HrmsOverviewPage`'s period filter, `Sidebar`'s collapsed state.
- No global client state library (Redux/Zustand/Jotai) yet. Introduce one
  only when state genuinely needs to be shared across routes in a way
  props/URL params can't express — not preemptively.
- Sidebar collapse state persists to `localStorage`
  (`octosphere.sidebarCollapsed`) since it's a per-browser UI preference,
  not app data.

## How the frontend calls the API

Every real API call goes through `frontend/src/lib/api.ts`
(`apiGet<T>(path)`), never a direct `fetch()` in a component. It attaches
the JWT access token from `localStorage` (`octosphere.accessToken`, not
set by anything yet — no login flow exists) and throws `ApiError` on a
non-2xx response. `VITE_API_BASE_URL` (see `frontend/.env.example`)
points it at the backend; it defaults to `http://localhost:8000` so a
fresh clone works without an `.env`.

## Formatting numbers, dates, percentages

Always go through `frontend/src/lib/formatters.ts` (`formatNumber`,
`formatPercent`, `formatRelativeTime`) rather than inlining
`.toLocaleString()`/`.toFixed()` in a component. Add a new formatter
there if you need a shape it doesn't have yet.

## The mock-to-real seam

A module without a real backend yet reads from its own `mockData.ts` (or
`.mock.ts` files), imported directly by its page component this early —
there's nothing to wrap in a hook until there's a real endpoint to swap
in. Once a module's backend exists, introduce a `data/use<Feature>.ts`
hook that returns the same shape and swap the page's import to that hook
instead of the mock file directly — the page component's JSX shouldn't
need to change. `useLocation()`-vs-`useParams()` note in ARCHITECTURE.md
applies here too: a hook used by shell-level chrome can't rely on route
params the way a hook used inside a routed page can.

## Linting & type-checking

- Frontend: `npm run lint` (oxlint) and `npx tsc -b` (from `frontend/`)
  must both be clean before a commit. `noUnusedLocals`/`noUnusedParameters`
  are on.
- Backend: `python manage.py test` (from `backend/`, with the venv
  active) must pass. No linter/formatter is pinned yet for Python — add
  one (ruff is the likely choice) when the codebase is big enough that
  style drift is a real risk, not for a single-app backend.

## Commits

Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`),
one logical unit of work per commit — not one commit per file, not one
giant commit per module. Commit as you complete each piece (a model, the
shell, one module's dashboard), not only at the end of a session.
