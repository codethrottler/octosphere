import { useEffect, useState } from 'react'

import { fetchAllEmployees } from '@/modules/hrms/employees/data'
import type { Employee } from '@/modules/hrms/employees/types'

function initialsOf(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Card grid, browsable/visual counterpart to the List view's dense table. */
export function DirectoryView() {
  const [employees, setEmployees] = useState<Employee[] | null>(null)

  useEffect(() => {
    fetchAllEmployees().then((page) => setEmployees(page.results))
  }, [])

  if (employees === null) {
    return <p className="text-sm text-ink-400">Loading…</p>
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {employees.map((employee) => (
        <div key={employee.id} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initialsOf(employee.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-900">{employee.name}</p>
            <p className="truncate text-xs text-ink-500">{employee.designation_name || employee.title || '—'}</p>
            <p className="truncate text-xs text-ink-400">{employee.department_name || '—'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
