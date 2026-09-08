import { AlarmClock, CalendarOff, CheckSquare, UserCheck, Users, Watch } from 'lucide-react'

import { useTeamOverview } from '@/modules/dashboard/data/useTeamOverview'
import { ActivityFeedCard } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'
import { DonutCard } from '@/shared/components/DonutCard/DonutCard'
import { KpiCard } from '@/shared/components/KpiCard/KpiCard'
import { MiniCalendarCard } from '@/shared/components/MiniCalendarCard/MiniCalendarCard'
import { formatNumber } from '@/shared/utils/formatters'

/** Manager-facing view of the reporting team: attendance today, task status, and the team leave calendar. */
export function TeamOverviewTab() {
  const { summary, taskStatus, leaveCalendar, activity } = useTeamOverview()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Team Size" value={formatNumber(summary.teamSize)} icon={Users} />
        <KpiCard label="Present Today" value={formatNumber(summary.presentToday)} icon={UserCheck} />
        <KpiCard label="On Leave Today" value={formatNumber(summary.onLeaveToday)} icon={CalendarOff} />
        <KpiCard label="Late Arrivals" value={formatNumber(summary.lateArrivals)} icon={Watch} />
        <KpiCard label="Team Open Tasks" value={formatNumber(summary.openTasks)} icon={CheckSquare} />
        <KpiCard
          label="Team Overdue Tasks"
          value={formatNumber(summary.overdueTasks)}
          icon={AlarmClock}
          trend={{ direction: 'up', label: 'Needs attention', sentiment: 'negative' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutCard title="Team Task Status" data={taskStatus} centerLabel="Tasks" />
        <MiniCalendarCard title="Team Leave Calendar" events={leaveCalendar} />
      </div>

      <ActivityFeedCard title="Team Activity" items={activity} />
    </div>
  )
}
