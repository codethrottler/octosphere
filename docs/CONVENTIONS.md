# OctoSphere — Conventions

Concrete rules for how code is written, so different sessions/modules stay
consistent. See `ARCHITECTURE.md` for *why* the codebase is shaped this
way; this doc is the *how*.

## File & folder naming

- **Components**: `PascalCase/` directory containing `PascalCase.tsx` —
  e.g. `shared/components/KpiCard/KpiCard.tsx`. One component per file. No
  `index.ts` barrel re-export — import the component file directly
  (`@/shared/components/KpiCard/KpiCard`). This keeps "where is this
  defined" a single grep away and avoids barrel-file circular-import
  footguns as the app grows.
- **Hooks**: `camelCase.ts`, named `use*`, in a `data/` folder for the
  module they belong to (e.g. `modules/dashboard/data/useMyOverview.ts`).
- **Mock data**: `camelCase.mock.ts`. Module-local mock lives in that
  module's `mock/` folder; mock backing a *shared* aggregation lives next
  to the aggregation in `shared/analytics/` (see ARCHITECTURE.md). The
  `.mock.ts` suffix is mandatory — it's what makes "grep for `.mock.ts` to
  find every seam that still needs a real API" work.
- **Types**: colocated with what they describe (a component's props are
  inline in its own file; a shared domain type gets its own `types.ts` next
  to the code that owns that domain, e.g. `app/session/types.ts`,
  `shared/notifications/types.ts`).
- **Config**: `camelCase.config.ts` for static lookup tables that aren't
  components, hooks, or types (`nav.config.ts`, `dashboard.config.ts`).

## Imports

- Use the `@/` alias for anything outside the current file's own directory
  (`@/shared/components/Badge/Badge`), configured in `tsconfig.app.json`
  and `vite.config.ts`. Relative imports (`./`, `../`) are fine only for
  files in the same component directory.
- Import order: external packages, then a blank line, then `@/` imports.
  Within each group, alphabetical. (Enforced by editor/formatter, not
  hand-maintained — don't fight it.)
- `import type { X }` for type-only imports (the codebase uses
  `verbatimModuleSyntax`, so this isn't optional style — mixing a type into
  a value import will fail the build).

## Components

- Function components, named exports (`export function KpiCard(...)`), not
  default exports. Named exports make renames/refactors show up in
  "find references" and keep import statements consistent everywhere.
- Props are an inline `interface <ComponentName>Props` directly above the
  component in the same file — not extracted to a shared types file unless
  more than one component needs the same shape.
- Styling is Tailwind utility classes on the JSX, no CSS modules, no
  styled-components. Use `clsx` for conditional classes. Design tokens
  (colors, font) are defined once in `src/index.css` via Tailwind v4's
  `@theme` block — reach for an existing `--color-*` token before
  hardcoding a hex value or introducing a new one.
- A component that renders nothing meaningful without data takes that data
  as props; it does not reach into a hook itself. Pages/tabs call the
  `use<Feature>()` hook and pass the result down — this is what keeps
  `shared/components/*` reusable across modules instead of coupled to one
  module's data shape.

## When to add a new shared primitive vs. reuse

Default to reusing `KpiCard`, `DonutCard`, `MiniCalendarCard`,
`ActivityFeedCard`, `Badge`, `Tabs`, `PermissionGate`, `Pagination`.
Only add a new one when an existing primitive genuinely can't express the
screen (different interaction model, not just different data) — and say so
in a comment at the top of the new component explaining the gap, the way
`Tabs`, `PermissionGate`, and `Pagination` do. "I need slightly different
spacing" is not a gap; passing a prop or wrapping the existing component
is.

## Data hooks

Every screen's data comes through a hook named `use<Feature>()` in that
module's `data/` folder — never a direct import of a `.mock.ts` file into
a page/tab component. The hook is the only place that changes when mock
data is replaced by a real API call:

```ts
// modules/<module>/data/useThing.ts
import { thingMock } from '@/modules/<module>/mock/thing.mock'

export function useThing() {
  return thingMock // becomes `return useQuery(...)` or similar, later
}
```

If a hook wraps a `shared/analytics/*` aggregation instead of local mock,
say so in a comment (see `useExecutiveOverview.ts`, `useHrOverview.ts`) so
the next person knows *why* it's not calling a `.mock.ts` file directly.

## Formatting numbers, dates, percentages

Always go through `shared/utils/formatters.ts`
(`formatNumber`, `formatPercent`, `formatRelativeTime`) rather than calling
`.toLocaleString()` / `.toFixed()` inline. Add a new formatter there if you
need a shape it doesn't have yet — don't one-off it in a component.

## Roles & permission gates

Gate on `hasRole(...roles)` from `useSession()`, checking "any of" a list
of roles — never `currentUser.role === 'x'` against a single role, since a
user can hold several. Wrap gated content in `<PermissionGate allow={...}>`
rather than conditionally rendering `null` — a gated screen should say
*why* it's empty, not look broken.

## Linting & type-checking

- `npm run lint` (oxlint) and `npx tsc -b` must both be clean before a
  commit. `noUnusedLocals`/`noUnusedParameters` are on — an unused import
  is a build error, not a warning.
- `oxlint`'s `only-export-components` warning is expected (not an error)
  for the two context files that export both a provider component and a
  `use*` hook (`SessionContext.tsx`, `NotificationsProvider.tsx`) — that
  pairing is intentional so the hook and its provider can't drift apart in
  separate files. Don't silence it by splitting those files.

## Commits

Small, incremental commits scoped to one logical unit (e.g. "add shared
Badge/Tabs/PermissionGate primitives", "add Dashboard shell + tab
routing", "add Task Overview tab"), not one commit per file and not one
giant commit per module.
