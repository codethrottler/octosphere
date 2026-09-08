import type { NotificationItem } from '@/shared/notifications/types'

export function getUnreadCount(items: NotificationItem[]): number {
  return items.filter((item) => !item.read).length
}
