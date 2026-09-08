import { clsx } from 'clsx'
import { NavLink, useLocation } from 'react-router-dom'

import { moduleNav } from '@/shell/nav.config'

/** Far-left icon rail: wordmark (not a nav item) + one icon-only button per module. */
export function IconRail() {
  const location = useLocation()

  return (
    <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-ink-200 bg-white py-3">
      <div
        aria-hidden="true"
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white"
      >
        O
      </div>

      {moduleNav.map((entry) => {
        const isActive = location.pathname.startsWith(entry.path)
        return (
          <NavLink
            key={entry.id}
            to={`${entry.path}/overview`}
            title={entry.label}
            aria-label={entry.label}
            className={clsx(
              'flex h-11 w-11 items-center justify-center rounded-lg transition-colors',
              isActive ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
            )}
          >
            <entry.icon className="h-5 w-5" />
          </NavLink>
        )
      })}
    </nav>
  )
}
