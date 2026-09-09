import { useEffect, useState } from 'react'

import { apiGet } from '@/lib/api'
import type { ActivityItem } from '@/widgets/ActivityFeedCard'
import type { DonutDatum } from '@/widgets/DonutCard'
import type { TrendDirection, TrendSentiment } from '@/widgets/KpiCard'
import type { CalendarHighlight } from '@/widgets/MiniCalendarCard'

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

interface OverviewResponse {
  kpis: {
    total_employees: number
    active_employees: number
    on_leave_today: number
    on_leave_today_trend: number[]
    new_joiners: number
    new_joiners_trend: number[]
    exits: number
    attendance_rate: number
    attendance_rate_trend: number[]
  }
  department_distribution: DonutDatum[]
  calendar_highlights: CalendarHighlight[]
  activity: { id: string; label: string; timestamp: string }[]
}

function directionFrom(trend: number[]): TrendDirection {
  if (trend.length < 2) return 'flat'
  const [first] = trend
  const last = trend[trend.length - 1]
  if (last > first) return 'up'
  if (last < first) return 'down'
  return 'flat'
}

function flat(value: number, points = 5): number[] {
  return Array.from({ length: points }, () => value)
}

function buildKpis(kpis: OverviewResponse['kpis']): KpiDatum[] {
  const pctActive = kpis.total_employees > 0 ? Math.round((kpis.active_employees / kpis.total_employees) * 1000) / 10 : 0

  return [
    {
      label: 'Total Employees',
      value: kpis.total_employees.toLocaleString(),
      trendData: flat(kpis.total_employees),
      deltaLabel: 'Current headcount',
      deltaDirection: 'flat',
      deltaSentiment: 'neutral',
    },
    {
      label: 'Active Employees',
      value: kpis.active_employees.toLocaleString(),
      trendData: flat(kpis.active_employees),
      deltaLabel: `${pctActive}% of headcount`,
      deltaDirection: 'flat',
      deltaSentiment: 'neutral',
    },
    {
      label: 'On Leave Today',
      value: kpis.on_leave_today.toLocaleString(),
      trendData: kpis.on_leave_today_trend,
      deltaLabel: 'Last 5 days',
      deltaDirection: directionFrom(kpis.on_leave_today_trend),
      deltaSentiment: 'neutral',
    },
    {
      label: 'New Joiners',
      value: kpis.new_joiners.toLocaleString(),
      trendData: kpis.new_joiners_trend,
      deltaLabel: 'This period',
      deltaDirection: directionFrom(kpis.new_joiners_trend),
      deltaSentiment: 'positive',
    },
    {
      label: 'Exits',
      value: kpis.exits.toLocaleString(),
      trendData: flat(kpis.exits),
      deltaLabel: 'All-time offboarded',
      deltaDirection: 'flat',
      deltaSentiment: 'neutral',
    },
    {
      label: 'Attendance Rate',
      value: `${kpis.attendance_rate}%`,
      trendData: kpis.attendance_rate_trend,
      deltaLabel: 'This period',
      deltaDirection: directionFrom(kpis.attendance_rate_trend),
      deltaSentiment: directionFrom(kpis.attendance_rate_trend) === 'down' ? 'negative' : 'positive',
    },
  ]
}

interface HrmsOverviewData {
  kpis: KpiDatum[]
  departmentDistribution: DonutDatum[]
  calendarHighlights: CalendarHighlight[]
  activityItems: ActivityItem[]
}

/**
 * Replaces mockData.ts — GET /api/hrms/overview/?period=<period>. This is
 * the "small diff" the mock-data-file isolation in Part 1 was meant to
 * enable: HrmsOverviewPage's JSX didn't need to change, only its data
 * source did. See backend/hrms/views/overview.py for exactly what's a
 * real computation vs. a documented snapshot/limitation.
 */
export function useHrmsOverview(period: PeriodKey): HrmsOverviewData | null {
  const [data, setData] = useState<HrmsOverviewData | null>(null)

  useEffect(() => {
    let cancelled = false
    apiGet<OverviewResponse>(`/api/hrms/overview/?period=${period}`).then((response) => {
      if (cancelled) return
      setData({
        kpis: buildKpis(response.kpis),
        departmentDistribution: response.department_distribution,
        calendarHighlights: response.calendar_highlights,
        activityItems: response.activity.map((item) => ({ id: item.id, label: item.label, timestamp: item.timestamp })),
      })
    })
    return () => {
      cancelled = true
    }
  }, [period])

  return data
}
