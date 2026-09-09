import { useState } from 'react'

import { Bell, ChevronDown, CircleHelp, LogOut, Search, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/AuthContext'

// Mock — Administration > Notifications owns the real count once that module exists.
const MOCK_UNREAD_NOTIFICATIONS = 5

const MOCK_SCOPES = ['Acme Corp — Headquarters', 'Acme Corp — EMEA', 'Acme Corp — APAC']

/** Full-width top bar: search, org/branch scope, directory + help shortcuts, notifications, avatar, wordmark. */
export function Header() {
  const { user, logout } = useAuth()
  const [scopeOpen, setScopeOpen] = useState(false)
  const [scope, setScope] = useState(MOCK_SCOPES[0])

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-ink-200 bg-white px-4">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          placeholder="Search OctoSphere…"
          className="w-full rounded-lg border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-300 focus:bg-white focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setScopeOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            {scope}
            <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
          </button>
          {scopeOpen ? (
            <>
              <button
                type="button"
                aria-label="Close scope menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setScopeOpen(false)}
              />
              <ul className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-ink-200 bg-white py-1 shadow-lg">
                {MOCK_SCOPES.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => {
                        setScope(s)
                        setScopeOpen(false)
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <span
          title={user ? `${user.name} — ${user.title || user.username}` : undefined}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700"
        >
          {user?.initials ?? '?'}
        </span>

        <button
          type="button"
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 hover:text-ink-800"
        >
          <LogOut className="h-5 w-5" />
        </button>

        <Link
          to="/hrms/employees"
          title="Employee Directory"
          aria-label="Employee Directory"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 hover:text-ink-800"
        >
          <UsersRound className="h-5 w-5" />
        </Link>

        <Link
          to="/service-desk/knowledge-base"
          title="Help & Knowledge Base"
          aria-label="Help & Knowledge Base"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 hover:text-ink-800"
        >
          <CircleHelp className="h-5 w-5" />
        </Link>

        <Link
          to="/administration/notifications"
          title="Notifications"
          aria-label={`Notifications, ${MOCK_UNREAD_NOTIFICATIONS} unread`}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 hover:text-ink-800"
        >
          <Bell className="h-5 w-5" />
          {MOCK_UNREAD_NOTIFICATIONS > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white">
              {MOCK_UNREAD_NOTIFICATIONS > 9 ? '9+' : MOCK_UNREAD_NOTIFICATIONS}
            </span>
          ) : null}
        </Link>

        <span className="ml-2 border-l border-ink-200 pl-3 text-sm font-semibold tracking-tight text-ink-900">
          OctoSphere
        </span>
      </div>
    </header>
  )
}
