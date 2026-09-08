import { useMemo, useState } from 'react'

import { clsx } from 'clsx'
import { Bell, CalendarDays, CheckSquare, ClipboardCheck, Settings2, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useNotifications } from '@/app/notifications/NotificationsProvider'
import { Badge, type BadgeTone } from '@/shared/components/Badge/Badge'
import { Pagination } from '@/shared/components/Pagination/Pagination'
import type { NotificationCategory } from '@/shared/notifications/types'
import { formatRelativeTime } from '@/shared/utils/formatters'

type ReadFilter = 'all' | 'unread' | 'read'
type CategoryFilter = 'all' | NotificationCategory

const CATEGORY_META: Record<NotificationCategory, { label: string; icon: typeof Bell; tone: BadgeTone }> = {
  task: { label: 'Task', icon: CheckSquare, tone: 'brand' },
  ticket: { label: 'Ticket', icon: Ticket, tone: 'info' },
  approval: { label: 'Approval', icon: ClipboardCheck, tone: 'warning' },
  leave: { label: 'Leave', icon: CalendarDays, tone: 'success' },
  system: { label: 'System', icon: Settings2, tone: 'neutral' },
}

const READ_FILTERS: { id: ReadFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
]

const PAGE_SIZE = 6

/** Dedicated notifications screen: filterable + paginated, with read/unread state shared with the header bell. */
export function NotificationsAlertsTab() {
  const { items, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return items
      .filter((item) => readFilter === 'all' || (readFilter === 'unread' ? !item.read : item.read))
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  }, [items, readFilter, categoryFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateReadFilter(next: ReadFilter) {
    setReadFilter(next)
    setPage(1)
  }

  function updateCategoryFilter(next: CategoryFilter) {
    setCategoryFilter(next)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {READ_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => updateReadFilter(filter.id)}
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                readFilter === filter.id ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
              )}
            >
              {filter.label}
              {filter.id === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : null}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => updateCategoryFilter(e.target.value as CategoryFilter)}
            className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs text-ink-700"
          >
            <option value="all">All categories</option>
            {Object.entries(CATEGORY_META).map(([id, meta]) => (
              <option key={id} value={id}>
                {meta.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-400">No notifications match this filter.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100">
          {pageItems.map((item) => {
            const meta = CATEGORY_META[item.category]
            const Icon = meta.icon
            return (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => markAsRead(item.id)}
                  className={clsx(
                    'flex items-start gap-3 rounded-lg px-2 py-3 hover:bg-ink-50',
                    !item.read && 'bg-brand-50/40',
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100">
                    <Icon className="h-4 w-4 text-ink-500" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className={clsx('truncate text-sm', item.read ? 'text-ink-700' : 'font-semibold text-ink-900')}>
                        {item.title}
                      </span>
                      {!item.read ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> : null}
                    </div>
                    <span className="truncate text-xs text-ink-500">{item.description}</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span className="text-xs text-ink-400">{formatRelativeTime(item.timestamp)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
    </div>
  )
}
