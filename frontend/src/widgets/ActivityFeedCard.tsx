import type { ComponentType } from 'react'

import { Activity } from 'lucide-react'

import { formatRelativeTime } from '@/lib/formatters'

export interface ActivityItem {
  id: string
  label: string
  timestamp: string // ISO
  icon?: ComponentType<{ className?: string }>
}

interface ActivityFeedCardProps {
  title: string
  items: ActivityItem[]
  emptyText?: string
}

/** Full-height recent-activity feed: icon + label + relative time per row. */
export function ActivityFeedCard({ title, items, emptyText = 'No recent activity.' }: ActivityFeedCardProps) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <span className="text-sm font-medium text-ink-500">{title}</span>
      {items.length === 0 ? (
        <p className="text-sm text-ink-400">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-3 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon ?? Activity
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100">
                  <Icon className="h-3.5 w-3.5 text-ink-500" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-ink-700">{item.label}</span>
                  <span className="text-xs text-ink-400">{formatRelativeTime(item.timestamp)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
