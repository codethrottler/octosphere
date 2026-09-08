export type NotificationCategory = 'task' | 'ticket' | 'approval' | 'leave' | 'system'

export interface NotificationItem {
  id: string
  category: NotificationCategory
  title: string
  description: string
  timestamp: string // ISO
  read: boolean
  /** Deep link back to the source record (ticket/task/approval). Module isn't built yet, so this is a mock path. */
  href: string
}
