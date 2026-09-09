import { useEffect, useMemo, useState } from 'react'

import { AgGridReact } from 'ag-grid-react'

import { fetchDepartments, fetchEmployeesPage, fetchTeams } from '@/modules/hrms/employees/data'
import { employeeListColumns } from '@/modules/hrms/employees/employeeList.columns'
import type { Department, Team } from '@/modules/hrms/employees/types'
import { defaultColDef, gridTheme } from '@/widgets/gridDefaults'
import { createInfiniteDatasource } from '@/widgets/gridDatasource'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'probation', label: 'Probation' },
  { value: 'offboarded', label: 'Offboarded' },
]

/** The first AG-Grid table — server-side pagination/sort/filter via widgets/gridDatasource.ts. */
export function EmployeeListView() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [team, setTeam] = useState('')
  const [status, setStatus] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    fetchDepartments().then((page) => setDepartments(page.results))
    fetchTeams().then((page) => setTeams(page.results))
  }, [])

  const datasource = useMemo(
    () =>
      createInfiniteDatasource((request) =>
        fetchEmployeesPage({ ...request, search: search || undefined, department: department || undefined, team: team || undefined, status: status || undefined }),
      ),
    [search, department, team, status],
  )

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search name, email, employee ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-ink-200 px-3 py-1.5 text-sm focus:border-brand-300 focus:outline-none"
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm text-ink-700"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm text-ink-700"
        >
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm text-ink-700"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-ink-200">
        <AgGridReact
          theme={gridTheme}
          columnDefs={employeeListColumns}
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
