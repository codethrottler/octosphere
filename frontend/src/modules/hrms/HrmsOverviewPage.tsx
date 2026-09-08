import { useState } from 'react'

import { PageHeader } from '@/shell/PageHeader'
import { ActivityFeedCard } from '@/widgets/ActivityFeedCard'
import { DonutCard } from '@/widgets/DonutCard'
import { KpiCard } from '@/widgets/KpiCard'
import { MiniCalendarCard } from '@/widgets/MiniCalendarCard'
import {
  activityItems,
  calendarHighlights,
  departmentDistribution,
  getHrmsKpis,
  periodOptions,
  type PeriodKey,
} from '@/modules/hrms/mockData'

/** The first per-module Overview dashboard, built on the shared widget pattern every other module's Overview will reuse. */
export function HrmsOverviewPage() {
  const [period, setPeriod] = useState<PeriodKey>('month')
  const kpis = getHrmsKpis(period)

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="HRMS Overview"
        filter={{
          value: period,
          options: periodOptions,
          onChange: (value) => setPeriod(value as PeriodKey),
        }}
      />

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DonutCard title="Department Distribution" data={departmentDistribution} centerLabel="Employees" />
            <MiniCalendarCard title="HR Calendar" highlights={calendarHighlights} />
          </div>
        </div>

        <ActivityFeedCard title="Recent HR Activity" items={activityItems} />
      </div>
    </div>
  )
}
