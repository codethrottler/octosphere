import type { ColDef } from 'ag-grid-community'

import type { AttendanceRecord } from '@/modules/hrms/attendance/types'

function formatTime(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

/** Column defs for My/Team Attendance grids — see docs/CONVENTIONS.md's AG-Grid column-def pattern. */
export const attendanceRecordsColumns: ColDef<AttendanceRecord>[] = [
  { field: 'date', headerName: 'Date', width: 130, sort: 'desc' },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'check_in', headerName: 'Check In', width: 110, valueFormatter: (p) => formatTime(p.value) },
  { field: 'check_out', headerName: 'Check Out', width: 110, valueFormatter: (p) => formatTime(p.value) },
  { field: 'notes', headerName: 'Notes', flex: 1, minWidth: 160, sortable: false },
]

export const teamAttendanceColumns: ColDef<AttendanceRecord>[] = [
  { field: 'employee_name', headerName: 'Employee', flex: 1, minWidth: 160, sortable: false },
  ...attendanceRecordsColumns,
]
