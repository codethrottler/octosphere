import { useEffect, useState } from 'react'

import { fetchLeaveBalances } from '@/modules/hrms/leave/data'
import type { LeaveBalance } from '@/modules/hrms/leave/types'

/** Per-type balance cards. Not KpiCard — that widget's sparkline is for a dashboard trend, not a fit for "allocated/used/remaining" browsing. */
export function BalanceTab() {
  const [balances, setBalances] = useState<LeaveBalance[] | null>(null)

  useEffect(() => {
    fetchLeaveBalances().then((page) => setBalances(page.results))
  }, [])

  if (balances === null) return <p className="text-sm text-ink-400">Loading…</p>
  if (balances.length === 0) return <p className="text-sm text-ink-400">No leave balances allocated yet.</p>

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((b) => {
        const remaining = Number(b.remaining_days)
        const allocated = Number(b.allocated_days)
        const pctUsed = allocated > 0 ? (Number(b.used_days) / allocated) * 100 : 0
        return (
          <div key={b.id} className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700">{b.leave_type_name}</span>
              <span className="text-xs text-ink-400">{b.year}</span>
            </div>
            <span className="text-2xl font-semibold text-ink-900">{remaining} days left</span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, pctUsed)}%` }} />
            </div>
            <span className="text-xs text-ink-400">
              {b.used_days} used of {b.allocated_days} allocated
            </span>
          </div>
        )
      })}
    </div>
  )
}
