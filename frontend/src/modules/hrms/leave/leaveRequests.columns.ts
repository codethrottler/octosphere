import type { ColDef } from 'ag-grid-community'

import type { LeaveRequest } from '@/modules/hrms/leave/types'

/** Column defs for the Apply Leave tab's "my requests" grid — see docs/CONVENTIONS.md's AG-Grid column-def pattern. */
export const leaveRequestsColumns: ColDef<LeaveRequest>[] = [
  { field: 'leave_type_name', headerName: 'Type', width: 140, sortable: false },
  { field: 'start_date', headerName: 'From', width: 120, sort: 'desc' },
  { field: 'end_date', headerName: 'To', width: 120 },
  { field: 'days_requested', headerName: 'Days', width: 90 },
  { field: 'approval_status', headerName: 'Status', width: 120 },
  { field: 'reason', headerName: 'Reason', flex: 1, minWidth: 160, sortable: false },
]
