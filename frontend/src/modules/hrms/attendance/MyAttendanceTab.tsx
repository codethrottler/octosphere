import { useEffect, useMemo, useState } from 'react'

import { AgGridReact } from 'ag-grid-react'
import { LogIn, LogOut } from 'lucide-react'

import { checkIn, checkOut, fetchAttendanceRecords } from '@/modules/hrms/attendance/data'
import { attendanceRecordsColumns } from '@/modules/hrms/attendance/attendanceRecords.columns'
import type { AttendanceRecord } from '@/modules/hrms/attendance/types'
import { defaultColDef, gridTheme } from '@/widgets/gridDefaults'
import { createInfiniteDatasource } from '@/widgets/gridDatasource'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function MyAttendanceTab() {
  const [today, setToday] = useState<AttendanceRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  async function loadToday() {
    const page = await fetchAttendanceRecords({ limit: 1, offset: 0, date_from: todayIso(), date_to: todayIso() })
    setToday(page.results[0] ?? null)
  }

  useEffect(() => {
    // loadToday's setState runs after its internal await, not synchronously in
    // this effect body — same accepted pattern as auth/AuthContext.tsx.
    // eslint-disable-next-line react/set-state-in-effect
    loadToday()
  }, [refreshToken])

  async function handleCheckIn() {
    setBusy(true)
    try {
      await checkIn()
      setRefreshToken((t) => t + 1)
    } finally {
      setBusy(false)
    }
  }

  async function handleCheckOut() {
    setBusy(true)
    try {
      await checkOut()
      setRefreshToken((t) => t + 1)
    } finally {
      setBusy(false)
    }
  }

  // refreshToken isn't read inside the callback — it's here deliberately, to force a
  // new datasource object (and so a grid refetch) after check-in/check-out.
  const datasource = useMemo(
    () => createInfiniteDatasource((request) => fetchAttendanceRecords({ ...request, scope: 'mine' })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshToken],
  )

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-800">Today</p>
          <p className="text-xs text-ink-500">
            {today?.check_in ? `Checked in at ${new Date(today.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Not checked in yet'}
            {today?.check_out ? ` · Checked out at ${new Date(today.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={busy || !!today?.check_in}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          Check In
        </button>
        <button
          type="button"
          onClick={handleCheckOut}
          disabled={busy || !today?.check_in || !!today?.check_out}
          className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-ink-50 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          Check Out
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-ink-200">
        <AgGridReact
          theme={gridTheme}
          columnDefs={attendanceRecordsColumns}
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
