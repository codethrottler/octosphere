import { Clock, Ticket, TicketCheck, TicketX } from 'lucide-react'

import { useServiceDeskOverview } from '@/modules/dashboard/data/useServiceDeskOverview'
import { ActivityFeedCard } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'
import { DonutCard } from '@/shared/components/DonutCard/DonutCard'
import { KpiCard } from '@/shared/components/KpiCard/KpiCard'
import { formatNumber } from '@/shared/utils/formatters'

/** Ticket volume, SLA health, and the per-desk breakdown (HR / IT / Admin) shared with Executive Overview. */
export function ServiceDeskOverviewTab() {
  const { totals, byDesk, activity } = useServiceDeskOverview()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Open Tickets" value={formatNumber(totals.open)} icon={Ticket} />
        <KpiCard label="Resolved Today" value={formatNumber(totals.resolvedToday)} icon={TicketCheck} />
        <KpiCard
          label="SLA Breached"
          value={formatNumber(totals.slaBreached)}
          icon={TicketX}
          trend={{ direction: 'up', label: 'Needs attention', sentiment: 'negative' }}
        />
        <KpiCard label="Avg Resolution Time" value={`${totals.avgResolutionHours}h`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutCard title="Tickets by Desk" data={byDesk} centerLabel="Open Tickets" centerValue={totals.open} />
        <ActivityFeedCard title="SLA Alerts & Recent Activity" items={activity} />
      </div>
    </div>
  )
}
