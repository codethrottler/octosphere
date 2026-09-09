import { useEffect, useMemo, useState } from 'react'

import { AgGridReact } from 'ag-grid-react'

import { applyLeave, fetchLeaveRequests, fetchLeaveTypes } from '@/modules/hrms/leave/data'
import { leaveRequestsColumns } from '@/modules/hrms/leave/leaveRequests.columns'
import type { LeaveType } from '@/modules/hrms/leave/types'
import { defaultColDef, gridTheme } from '@/widgets/gridDefaults'
import { createInfiniteDatasource } from '@/widgets/gridDatasource'

export function ApplyLeaveTab() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    fetchLeaveTypes().then((page) => {
      setLeaveTypes(page.results)
      if (page.results.length > 0) setLeaveType(String(page.results[0].id))
    })
  }, [])

  async function handleSubmit() {
    if (!leaveType || !startDate || !endDate) return
    setError(null)
    setSaving(true)
    try {
      await applyLeave({ leave_type: Number(leaveType), start_date: startDate, end_date: endDate, reason })
      setStartDate('')
      setEndDate('')
      setReason('')
      setRefreshToken((t) => t + 1)
    } catch {
      setError('Could not submit — check the dates and try again.')
    } finally {
      setSaving(false)
    }
  }

  // refreshToken forces a fresh datasource (new object reference) after a successful apply — see MyAttendanceTab for the same pattern.
  const datasource = useMemo(
    () => createInfiniteDatasource((request) => fetchLeaveRequests({ ...request, scope: 'mine' })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshToken],
  )

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-700">Leave type</span>
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="input">
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-700">From</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-700">To</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
        </label>
        <label className="flex flex-1 min-w-[200px] flex-col gap-1 text-sm">
          <span className="font-medium text-ink-700">Reason</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} className="input" />
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? 'Submitting…' : 'Apply'}
        </button>
        {error ? <p className="w-full text-sm text-danger-700">{error}</p> : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-ink-200">
        <AgGridReact
          theme={gridTheme}
          columnDefs={leaveRequestsColumns}
          defaultColDef={defaultColDef}
          rowModelType="infinite"
          datasource={datasource}
          cacheBlockSize={25}
          maxBlocksInCache={10}
          animateRows
        />
      </div>
    </div>
  )
}
