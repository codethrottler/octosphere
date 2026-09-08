import { CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react'

import type { ActivityItem } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'
import type { CalendarEvent } from '@/shared/components/MiniCalendarCard/MiniCalendarCard'

export const myOverviewSummaryMock = {
  tasksDueToday: 4,
  overdueTasks: 1,
  leaveBalanceDays: 12,
  pendingApprovals: 2,
  openTickets: 1,
}

export const myCalendarEventsMock: CalendarEvent[] = [
  { date: '2026-09-08', type: 'task', label: 'Submit onboarding checklist' },
  { date: '2026-09-09', type: 'meeting', label: '1:1 with Sarah Chen' },
  { date: '2026-09-10', type: 'deadline', label: 'Q3 budget review due' },
  { date: '2026-09-11', type: 'meeting', label: 'Sprint planning' },
  { date: '2026-09-15', type: 'leave', label: 'Annual leave' },
  { date: '2026-09-16', type: 'leave', label: 'Annual leave' },
  { date: '2026-09-17', type: 'leave', label: 'Annual leave' },
  { date: '2026-09-22', type: 'event', label: 'Town hall' },
]

export const myActivityMock: ActivityItem[] = [
  { id: 'my_1', description: 'You completed "Prepare onboarding checklist".', timestamp: '1h ago', icon: CheckCircle2 },
  { id: 'my_2', description: 'Sarah Chen commented on your task "API design review".', timestamp: '3h ago', icon: MessageSquare },
  { id: 'my_3', description: 'Your expense report was approved.', timestamp: 'Yesterday', icon: ThumbsUp },
]
