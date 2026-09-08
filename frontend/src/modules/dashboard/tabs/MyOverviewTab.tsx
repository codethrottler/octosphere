import { AlarmClock, CalendarDays, CheckSquare, ClipboardCheck, Ticket } from 'lucide-react'

import { useMyOverview } from '@/modules/dashboard/data/useMyOverview'
import { ActivityFeedCard } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'
import { KpiCard } from '@/shared/components/KpiCard/KpiCard'
import { MiniCalendarCard } from '@/shared/components/MiniCalendarCard/MiniCalendarCard'
import { formatNumber } from '@/shared/utils/formatters'

/** The signed-in user's personal snapshot: tasks due, leave balance, pending approvals, open tickets. */
export function MyOverviewTab() {
  const { summary, calendarEvents, activity } = useMyOverview()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Tasks Due Today" value={formatNumber(summary.tasksDueToday)} icon={CheckSquare} />
        <KpiCard
          label="Overdue Tasks"
          value={formatNumber(summary.overdueTasks)}
          icon={AlarmClock}
          trend={
            summary.overdueTasks > 0
              ? { direction: 'up', label: 'Needs attention', sentiment: 'negative' }
              : undefined
          }
        />
        <KpiCard label="Leave Balance" value={`${summary.leaveBalanceDays} days`} icon={CalendarDays} />
        <KpiCard label="Pending Approvals" value={formatNumber(summary.pendingApprovals)} icon={ClipboardCheck} />
        <KpiCard label="My Open Tickets" value={formatNumber(summary.openTickets)} icon={Ticket} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MiniCalendarCard title="My Calendar" events={calendarEvents} />
        <ActivityFeedCard title="My Recent Activity" items={activity} />
      </div>
    </div>
  )
}
