import { useEffect, useState } from 'react'

import { fetchLeaveRequests } from '@/modules/hrms/leave/data'
import { MiniCalendarCard, type CalendarHighlight } from '@/widgets/MiniCalendarCard'

const TONE: Record<string, CalendarHighlight['tone']> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'brand',
}

function eachDate(start: string, end: string): string[] {
  const dates: string[] = []
  const cursor = new Date(start)
  const last = new Date(end)
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function LeaveCalendarTab() {
  const [highlights, setHighlights] = useState<CalendarHighlight[]>([])

  useEffect(() => {
    fetchLeaveRequests({ limit: 50, offset: 0, scope: 'mine' }).then((page) => {
      const expanded: CalendarHighlight[] = []
      for (const request of page.results) {
        for (const date of eachDate(request.start_date, request.end_date)) {
          expanded.push({ date, label: `${request.leave_type_name} (${request.approval_status})`, tone: TONE[request.approval_status] })
        }
      }
      setHighlights(expanded)
    })
  }, [])

  return (
    <div className="max-w-md">
      <MiniCalendarCard title="My Leave Calendar" highlights={highlights} />
    </div>
  )
}
