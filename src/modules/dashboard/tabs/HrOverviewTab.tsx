import { ClipboardList, LogOut, UserPlus, Users } from 'lucide-react'

import { useHrOverview } from '@/modules/dashboard/data/useHrOverview'
import { ActivityFeedCard } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'
import { DonutCard } from '@/shared/components/DonutCard/DonutCard'
import { KpiCard } from '@/shared/components/KpiCard/KpiCard'
import { formatNumber } from '@/shared/utils/formatters'

/** HR-role snapshot: headcount, new joiners, exits, and pending leave requests. */
export function HrOverviewTab() {
  const { summary, activity } = useHrOverview()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total Employees" value={formatNumber(summary.headcount.total)} icon={Users} />
        <KpiCard label="New Joiners" value={formatNumber(summary.headcount.newJoiners)} icon={UserPlus} footnote="This month" />
        <KpiCard label="Exits" value={formatNumber(summary.headcount.exits)} icon={LogOut} footnote="This month" />
        <KpiCard label="On Leave Today" value={formatNumber(summary.headcount.onLeave)} icon={Users} />
        <KpiCard
          label="Leave Requests Pending"
          value={formatNumber(summary.leaveRequestsPending)}
          icon={ClipboardList}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutCard title="Department Distribution" data={summary.departmentDistribution} centerLabel="Employees" />
        <ActivityFeedCard title="Recent HR Activity" items={activity} />
      </div>
    </div>
  )
}
