import type { ColDef } from 'ag-grid-community'

import type { Employee } from '@/modules/hrms/employees/types'

/**
 * Column defs for the Employee List grid, kept out of the page component
 * per docs/CONVENTIONS.md. `field` doubles as the sort colId sent to the
 * backend (see widgets/gridDatasource.ts) — must match
 * EMPLOYEE_ORDERING_FIELDS in backend/hrms/views/employees.py for sorting
 * to actually apply; columns not in that set are still sortable in the
 * UI but silently no-op server-side.
 */
export const employeeListColumns: ColDef<Employee>[] = [
  { field: 'employee_code', headerName: 'ID', width: 110 },
  { field: 'name', headerName: 'Name', flex: 1.4, minWidth: 160 },
  { field: 'designation_name', headerName: 'Designation', flex: 1, minWidth: 150, sortable: false },
  { field: 'department_name', headerName: 'Department', flex: 1, minWidth: 140, sortable: false },
  { field: 'team_name', headerName: 'Team', flex: 1, minWidth: 120, sortable: false },
  { field: 'manager_name', headerName: 'Manager', flex: 1, minWidth: 140, sortable: false },
  { field: 'employment_status', headerName: 'Status', width: 130 },
  { field: 'date_joined_company', headerName: 'Joined', width: 120 },
  { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 180, sortable: false },
]
