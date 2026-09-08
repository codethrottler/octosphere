import { NavLink } from 'react-router-dom'

import { clsx } from 'clsx'

import { moduleNav } from '@/app/shell/nav.config'

/** Left-hand module rail. The logo above it is also a click-through to Home for redundancy. */
export function IconRail() {
  return (
    <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-ink-200 bg-white py-3">
      <NavLink
        to="/dashboard"
        aria-label="OctoSphere Home"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white"
      >
        O
      </NavLink>

      {moduleNav.map((entry) => (
        <NavLink
          key={entry.id}
          to={entry.path}
          title={entry.label}
          className={({ isActive }) =>
            clsx(
              'flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium transition-colors',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
            )
          }
        >
          <entry.icon className="h-5 w-5" />
        </NavLink>
      ))}
    </nav>
  )
}
