import { AlarmClock, CheckSquare, ListTodo, PercentCircle, TrendingDown } from 'lucide-react'

import { useTaskOverview } from '@/modules/dashboard/data/useTaskOverview'
import { ActivityFeedCard } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'
import { DonutCard } from '@/shared/components/DonutCard/DonutCard'
import { KpiCard } from '@/shared/components/KpiCard/KpiCard'
import { formatNumber, formatPercent } from '@/shared/utils/formatters'

/** Task/project snapshot across the org: totals, completion and overdue rates, and recent task activity. */
export function TaskOverviewTab() {
  const { totals, completionRate, overdueRate, statusDistribution, activity } = useTaskOverview()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total Tasks" value={formatNumber(totals.total)} icon={ListTodo} />
        <KpiCard label="Completed" value={formatNumber(totals.completed)} icon={CheckSquare} />
        <KpiCard label="In Progress" value={formatNumber(totals.inProgress)} icon={ListTodo} />
        <KpiCard
          label="Overdue"
          value={formatNumber(totals.overdue)}
          icon={AlarmClock}
          trend={{ direction: 'up', label: 'Needs attention', sentiment: 'negative' }}
        />
        <KpiCard label="Completion Rate" value={formatPercent(completionRate)} icon={PercentCircle} />
        <KpiCard
          label="Overdue Rate"
          value={formatPercent(overdueRate)}
          icon={TrendingDown}
          trend={{ direction: 'down', label: 'vs. target 5%', sentiment: 'negative' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutCard title="Task Status Distribution" data={statusDistribution} centerLabel="Tasks" />
        <ActivityFeedCard title="Recent Task Activity" items={activity} />
      </div>
    </div>
  )
}
