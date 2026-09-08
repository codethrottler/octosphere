import { CalendarClock, CheckSquare, Clock, Ticket, TicketX, Users } from 'lucide-react'

import { useExecutiveOverview } from '@/modules/dashboard/data/useExecutiveOverview'
import { executiveActivityMock } from '@/modules/dashboard/mock/executiveActivity.mock'
import { ActivityFeedCard } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'
import { DonutCard } from '@/shared/components/DonutCard/DonutCard'
import { KpiCard } from '@/shared/components/KpiCard/KpiCard'
import { formatNumber, formatPercent } from '@/shared/utils/formatters'

/** Cross-module glance: headcount, task completion, ticket/SLA health, and pending leave in one view. */
export function ExecutiveOverviewTab() {
  const summary = useExecutiveOverview()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        <KpiCard label="Total Employees" value={formatNumber(summary.headcount.total)} icon={Users} />
        <KpiCard label="Active Employees" value={formatNumber(summary.headcount.active)} icon={Users} />
        <KpiCard
          label="Task Completion Rate"
          value={formatPercent(summary.taskCompletionRate)}
          icon={CheckSquare}
        />
        <KpiCard label="Open Tickets" value={formatNumber(summary.tickets.open)} icon={Ticket} />
        <KpiCard
          label="SLA Breached"
          value={formatNumber(summary.tickets.slaBreached)}
          icon={TicketX}
          trend={{ direction: 'up', label: 'Needs attention', sentiment: 'negative' }}
        />
        <KpiCard label="Leave Pending" value={formatNumber(summary.leavePending)} icon={CalendarClock} />
        <KpiCard
          label="Avg. Resolution Time"
          value={`${summary.tickets.avgResolutionHours}h`}
          icon={Clock}
          footnote="Across all desks"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutCard title="Department Distribution" data={summary.departmentDistribution} centerLabel="Employees" />
        <DonutCard
          title="Tickets by Desk"
          data={summary.ticketsByDesk}
          centerLabel="Open Tickets"
          centerValue={summary.tickets.open}
        />
      </div>

      <ActivityFeedCard title="Org-wide Activity" items={executiveActivityMock} />
    </div>
  )
}
