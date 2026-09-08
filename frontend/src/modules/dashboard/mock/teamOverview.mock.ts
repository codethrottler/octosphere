import { CalendarClock, ClipboardCheck, UserCheck } from 'lucide-react'

import type { ActivityItem } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'
import type { CalendarEvent } from '@/shared/components/MiniCalendarCard/MiniCalendarCard'
import type { DonutDatum } from '@/shared/components/DonutCard/DonutCard'

export const teamOverviewSummaryMock = {
  teamSize: 11,
  presentToday: 9,
  onLeaveToday: 1,
  lateArrivals: 2,
  openTasks: 34,
  overdueTasks: 6,
}

export const teamTaskStatusMock: DonutDatum[] = [
  { name: 'Completed', value: 58, color: 'var(--color-success-500)' },
  { name: 'In Progress', value: 34, color: 'var(--color-info-500)' },
  { name: 'Overdue', value: 6, color: 'var(--color-danger-500)' },
]

export const teamLeaveCalendarMock: CalendarEvent[] = [
  { date: '2026-09-08', type: 'leave', label: 'Arjun Mehta — Sick leave' },
  { date: '2026-09-11', type: 'leave', label: 'Wei Zhang — Annual leave' },
  { date: '2026-09-12', type: 'leave', label: 'Wei Zhang — Annual leave' },
  { date: '2026-09-18', type: 'meeting', label: 'Team sync' },
  { date: '2026-09-24', type: 'leave', label: 'Fatima Al-Sayed — Annual leave' },
]

export const teamActivityMock: ActivityItem[] = [
  { id: 'team_1', description: 'Arjun Mehta marked "Deploy staging config" complete.', timestamp: '40m ago', icon: ClipboardCheck },
  { id: 'team_2', description: 'Wei Zhang checked in — on time.', timestamp: '2h ago', icon: UserCheck },
  { id: 'team_3', description: 'Fatima Al-Sayed requested leave for Sep 24.', timestamp: '4h ago', icon: CalendarClock },
]
