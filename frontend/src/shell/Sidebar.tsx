import { useEffect, useState } from 'react'

import { clsx } from 'clsx'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { getHealth } from '@/lib/api'
import { moduleNav } from '@/shell/nav.config'

const COLLAPSE_STORAGE_KEY = 'octosphere.sidebarCollapsed'

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Second column: labeled sub-nav for whichever module is active.
 * Collapsible, state persisted per browser.
 *
 * Derives the active module from the URL path (useLocation), NOT
 * useParams — Sidebar is rendered by AppShell as a sibling of <Routes>,
 * not nested inside the matched Route's element tree, so useParams here
 * would never see :moduleId. Same technique as IconRail.
 */
export function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)

  const activeModule = moduleNav.find((m) => location.pathname.startsWith(m.path)) ?? moduleNav[0]

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed))
    } catch {
      // localStorage unavailable (private mode etc.) — collapse state just won't persist
    }
  }, [collapsed])

  useEffect(() => {
    let cancelled = false
    getHealth()
      .then(() => !cancelled && setApiConnected(true))
      .catch(() => !cancelled && setApiConnected(false))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <aside
      className={clsx(
        'flex shrink-0 flex-col border-r border-ink-200 bg-white transition-[width]',
        collapsed ? 'w-14' : 'w-[220px]',
      )}
    >
      <div className={clsx('flex-1 overflow-y-auto py-3', collapsed ? 'px-1.5' : 'px-3')}>
        {!collapsed ? (
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{activeModule.label}</h2>
        ) : null}
        <ul className="flex flex-col gap-0.5">
          {activeModule.sidebar.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`${activeModule.path}/${item.id}`}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                    collapsed && 'justify-center px-0',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className={clsx('flex flex-col gap-2 border-t border-ink-100 py-2', collapsed ? 'items-center px-1.5' : 'px-3')}>
        {apiConnected !== null ? (
          <div
            className={clsx('flex items-center gap-1.5 text-xs text-ink-400', collapsed && 'justify-center')}
            title={apiConnected ? 'Backend API reachable' : 'Backend API unreachable'}
          >
            <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', apiConnected ? 'bg-success-500' : 'bg-danger-500')} />
            {!collapsed ? <span>{apiConnected ? 'API connected' : 'API offline'}</span> : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-800"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  )
}
