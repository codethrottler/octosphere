import { useState } from 'react'

import { periodOptions, useHrmsOverview, type PeriodKey } from '@/modules/hrms/data/useHrmsOverview'
import { PageHeader } from '@/shell/PageHeader'
import { ActivityFeedCard } from '@/widgets/ActivityFeedCard'
import { DonutCard } from '@/widgets/DonutCard'
import { KpiCard } from '@/widgets/KpiCard'
import { MiniCalendarCard } from '@/widgets/MiniCalendarCard'

/** The first per-module Overview dashboard, built on the shared widget pattern every other module's Overview will reuse. */
export function HrmsOverviewPage() {
  const [period, setPeriod] = useState<PeriodKey>('month')
  const data = useHrmsOverview(period)

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

      {data === null ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DonutCard title="Department Distribution" data={data.departmentDistribution} centerLabel="Employees" />
              <MiniCalendarCard title="HR Calendar" highlights={data.calendarHighlights} />
            </div>
          </div>

          <ActivityFeedCard title="Recent HR Activity" items={data.activityItems} />
        </div>
      )}
    </div>
  )
}
