import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useNotifications } from '@/app/notifications/NotificationsProvider'
import { useSession } from '@/app/session/SessionContext'

export function TopBar() {
  const { currentUser } = useSession()
  const { unreadCount } = useNotifications()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-200 bg-white px-5">
      <Link to="/dashboard" className="text-sm font-semibold tracking-tight text-ink-900">
        OctoSphere
      </Link>

      <div className="flex items-center gap-4">
        <Link
          to="/dashboard?tab=notifications"
          aria-label={`Notifications, ${unreadCount} unread`}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 hover:text-ink-800"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Link>

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {currentUser.initials}
          </span>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium text-ink-800">{currentUser.name}</span>
            <span className="text-xs text-ink-400">{currentUser.title}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
