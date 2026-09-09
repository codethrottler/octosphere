import { useMemo } from 'react'

import { AgGridReact } from 'ag-grid-react'

import { teamAttendanceColumns } from '@/modules/hrms/attendance/attendanceRecords.columns'
import { fetchAttendanceRecords } from '@/modules/hrms/attendance/data'
import { defaultColDef, gridTheme } from '@/widgets/gridDefaults'
import { createInfiniteDatasource } from '@/widgets/gridDatasource'

/** My direct reports' attendance — "my team" = core.User.manager, same reasoning as the backend (see docs/ARCHITECTURE.md). */
export function TeamAttendanceTab() {
  const datasource = useMemo(() => createInfiniteDatasource((request) => fetchAttendanceRecords({ ...request, scope: 'team' })), [])

  return (
    <div className="h-full min-h-0 overflow-hidden rounded-xl border border-ink-200">
      <AgGridReact
        theme={gridTheme}
        columnDefs={teamAttendanceColumns}
        defaultColDef={defaultColDef}
        rowModelType="infinite"
        datasource={datasource}
        cacheBlockSize={25}
        maxBlocksInCache={10}
        animateRows
      />
    </div>
  )
}
