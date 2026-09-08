import type { CalendarHighlight } from '@/widgets/MiniCalendarCard'
import type { DonutDatum } from '@/widgets/DonutCard'
import type { ActivityItem } from '@/widgets/ActivityFeedCard'
import type { TrendDirection, TrendSentiment } from '@/widgets/KpiCard'
import { CheckCircle2, LogOut, UserCheck, UserPlus } from 'lucide-react'

/**
 * All mock data for the HRMS Overview dashboard, isolated here so wiring
 * this page to the real /api/hrms/ endpoints later (once that module's
 * backend exists) is a small diff: replace the useHrmsOverview() hook's
 * body, leave HrmsOverviewPage.tsx untouched.
 */

export type PeriodKey = 'today' | 'week' | 'month' | 'quarter'

export const periodOptions: { value: PeriodKey; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
]

interface KpiDatum {
  label: string
  value: string
  trendData: number[]
  deltaLabel: string
  deltaDirection: TrendDirection
  deltaSentiment: TrendSentiment
}

// Total/Active Employees and On Leave Today are point-in-time snapshots — they don't change when
// the period filter changes, only the flow metrics (New Joiners, Exits, Attendance Rate) do.
const snapshotKpis: KpiDatum[] = [
  {
    label: 'Total Employees',
    value: '1,284',
    trendData: [1198, 1210, 1225, 1241, 1256, 1270, 1284],
    deltaLabel: '+7.2% YoY',
    deltaDirection: 'up',
    deltaSentiment: 'positive',
  },
  {
    label: 'Active Employees',
    value: '1,231',
    trendData: [1150, 1165, 1180, 1198, 1210, 1222, 1231],
    deltaLabel: '95.9% of headcount',
    deltaDirection: 'flat',
    deltaSentiment: 'neutral',
  },
  {
    label: 'On Leave Today',
    value: '42',
    trendData: [35, 38, 31, 40, 37, 44, 42],
    deltaLabel: '3.3% of headcount',
    deltaDirection: 'flat',
    deltaSentiment: 'neutral',
  },
]

const flowKpisByPeriod: Record<PeriodKey, KpiDatum[]> = {
  today: [
    { label: 'New Joiners', value: '1', trendData: [0, 1, 0, 0, 1, 0, 1], deltaLabel: 'vs. 0 yesterday', deltaDirection: 'up', deltaSentiment: 'positive' },
    { label: 'Exits', value: '0', trendData: [1, 0, 0, 1, 0, 0, 0], deltaLabel: 'vs. 1 yesterday', deltaDirection: 'down', deltaSentiment: 'positive' },
    { label: 'Attendance Rate', value: '96.4%', trendData: [94.1, 95.0, 93.8, 96.0, 95.4, 96.1, 96.4], deltaLabel: '+0.3pt vs. yesterday', deltaDirection: 'up', deltaSentiment: 'positive' },
  ],
  week: [
    { label: 'New Joiners', value: '4', trendData: [2, 3, 3, 5, 4, 3, 4], deltaLabel: '+1 vs. last week', deltaDirection: 'up', deltaSentiment: 'positive' },
    { label: 'Exits', value: '2', trendData: [3, 2, 4, 1, 2, 3, 2], deltaLabel: '-1 vs. last week', deltaDirection: 'down', deltaSentiment: 'positive' },
    { label: 'Attendance Rate', value: '95.8%', trendData: [94.5, 95.1, 94.9, 95.6, 95.3, 95.9, 95.8], deltaLabel: '+0.5pt vs. last week', deltaDirection: 'up', deltaSentiment: 'positive' },
  ],
  month: [
    { label: 'New Joiners', value: '18', trendData: [11, 13, 15, 14, 16, 19, 18], deltaLabel: '+4 vs. last month', deltaDirection: 'up', deltaSentiment: 'positive' },
    { label: 'Exits', value: '9', trendData: [12, 10, 11, 9, 10, 8, 9], deltaLabel: '-3 vs. last month', deltaDirection: 'down', deltaSentiment: 'positive' },
    { label: 'Attendance Rate', value: '94.9%', trendData: [93.8, 94.1, 94.5, 94.2, 94.7, 95.1, 94.9], deltaLabel: '+1.1pt vs. last month', deltaDirection: 'up', deltaSentiment: 'positive' },
  ],
  quarter: [
    { label: 'New Joiners', value: '51', trendData: [38, 42, 45, 47, 49, 53, 51], deltaLabel: '+9 vs. last quarter', deltaDirection: 'up', deltaSentiment: 'positive' },
    { label: 'Exits', value: '24', trendData: [29, 27, 25, 26, 23, 22, 24], deltaLabel: '-5 vs. last quarter', deltaDirection: 'down', deltaSentiment: 'positive' },
    { label: 'Attendance Rate', value: '95.3%', trendData: [93.5, 94.0, 94.4, 94.8, 95.0, 95.5, 95.3], deltaLabel: '+0.8pt vs. last quarter', deltaDirection: 'up', deltaSentiment: 'positive' },
  ],
}

export function getHrmsKpis(period: PeriodKey): KpiDatum[] {
  // Snapshot cards first, then the period-sensitive flow cards — keeps the 2-column grid's reading order stable.
  return [...snapshotKpis, ...flowKpisByPeriod[period]]
}

export const departmentDistribution: DonutDatum[] = [
  { name: 'Engineering', value: 412, color: 'var(--color-brand-500)' },
  { name: 'Sales', value: 268, color: 'var(--color-info-500)' },
  { name: 'Operations', value: 231, color: 'var(--color-success-500)' },
  { name: 'Customer Support', value: 187, color: 'var(--color-warning-500)' },
  { name: 'Finance', value: 98, color: 'var(--color-desk-hr)' },
  { name: 'Other', value: 88, color: 'var(--color-ink-300)' },
]

export const calendarHighlights: CalendarHighlight[] = [
  { date: '2026-09-08', label: '3 leave requests pending', tone: 'warning' },
  { date: '2026-09-11', label: 'Quarterly performance reviews due', tone: 'brand' },
  { date: '2026-09-15', label: 'New joiner cohort starts', tone: 'success' },
  { date: '2026-09-18', label: 'Founders Day (company holiday)', tone: 'danger' },
]

export const activityItems: ActivityItem[] = [
  { id: 'act_1', label: 'Neha Kapoor completed onboarding — Engineering.', timestamp: '2026-09-08T13:53:00Z', icon: UserPlus },
  { id: 'act_2', label: 'Daniel Osei’s probation review was marked complete.', timestamp: '2026-09-08T12:15:00Z', icon: UserCheck },
  { id: 'act_3', label: 'Marcus Webb’s exit process was initiated.', timestamp: '2026-09-08T09:40:00Z', icon: LogOut },
  { id: 'act_4', label: 'Q3 performance review cycle opened for Sales.', timestamp: '2026-09-07T16:20:00Z', icon: CheckCircle2 },
  { id: 'act_5', label: 'Arjun Mehta’s leave request was approved.', timestamp: '2026-09-07T11:05:00Z', icon: CheckCircle2 },
  { id: 'act_6', label: '3 new employees onboarded in Operations.', timestamp: '2026-09-05T08:30:00Z', icon: UserPlus },
]
