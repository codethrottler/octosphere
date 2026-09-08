import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import { notificationsMock } from '@/shared/notifications/notifications.mock'
import { getUnreadCount } from '@/shared/notifications/selectors'
import type { NotificationItem } from '@/shared/notifications/types'

interface NotificationsValue {
  items: NotificationItem[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationsContext = createContext<NotificationsValue | null>(null)

/**
 * Owns notification read/unread state so the header bell badge (shell) and
 * the Notifications & Alerts screen (dashboard module) stay in sync — one
 * source of truth instead of the tab managing its own local copy.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>(notificationsMock)

  const value = useMemo<NotificationsValue>(
    () => ({
      items,
      unreadCount: getUnreadCount(items),
      markAsRead: (id) =>
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item))),
      markAllAsRead: () => setItems((prev) => prev.map((item) => ({ ...item, read: true }))),
    }),
    [items],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications(): NotificationsValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return ctx
}
