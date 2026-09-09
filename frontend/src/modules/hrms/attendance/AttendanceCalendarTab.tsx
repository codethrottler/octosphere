import { useEffect, useState } from 'react'

import { fetchMyRecentAttendance } from '@/modules/hrms/attendance/data'
import { MiniCalendarCard, type CalendarHighlight } from '@/widgets/MiniCalendarCard'

const STATUS_TONE: Record<string, CalendarHighlight['tone']> = {
  present: 'success',
  absent: 'danger',
  half_day: 'warning',
  on_leave: 'warning',
  holiday: 'brand',
  weekend: 'brand',
}

const STATUS_LABEL: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  half_day: 'Half day',
  on_leave: 'On leave',
  holiday: 'Holiday',
  weekend: 'Weekend',
}

export function AttendanceCalendarTab() {
  const [highlights, setHighlights] = useState<CalendarHighlight[]>([])

  useEffect(() => {
    fetchMyRecentAttendance().then((page) => {
      setHighlights(
        page.results
          .filter((r) => r.status !== 'weekend')
          .map((r) => ({ date: r.date, label: STATUS_LABEL[r.status] ?? r.status, tone: STATUS_TONE[r.status] ?? 'brand' })),
      )
    })
  }, [])

  return (
    <div className="max-w-md">
      <MiniCalendarCard title="My Attendance Calendar" highlights={highlights} />
    </div>
  )
}
