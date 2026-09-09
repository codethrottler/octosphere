import { useState } from 'react'

import { AttendanceCalendarTab } from '@/modules/hrms/attendance/AttendanceCalendarTab'
import { CorrectionsTab } from '@/modules/hrms/attendance/CorrectionsTab'
import { MyAttendanceTab } from '@/modules/hrms/attendance/MyAttendanceTab'
import { TeamAttendanceTab } from '@/modules/hrms/attendance/TeamAttendanceTab'
import { PageHeader } from '@/shell/PageHeader'
import { SubTabs } from '@/widgets/SubTabs'

const TABS = [
  { id: 'my', label: 'My Attendance' },
  { id: 'team', label: 'Team Attendance' },
  { id: 'calendar', label: 'Attendance Calendar' },
  { id: 'corrections', label: 'Corrections' },
] as const

type TabId = (typeof TABS)[number]['id']

export function AttendancePage() {
  const [tab, setTab] = useState<TabId>('my')

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Attendance" />
      <SubTabs tabs={TABS} activeId={tab} onChange={(id) => setTab(id as TabId)} />
      <div className="min-h-0 flex-1">
        {tab === 'my' && <MyAttendanceTab />}
        {tab === 'team' && <TeamAttendanceTab />}
        {tab === 'calendar' && <AttendanceCalendarTab />}
        {tab === 'corrections' && <CorrectionsTab />}
      </div>
    </div>
  )
}
