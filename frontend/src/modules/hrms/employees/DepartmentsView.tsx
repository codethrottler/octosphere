import { useEffect, useState } from 'react'

import { fetchDepartments } from '@/modules/hrms/employees/data'
import type { Department } from '@/modules/hrms/employees/types'

/** Read-only browse — creating/editing departments belongs to Administration > Organization, not built yet. */
export function DepartmentsView() {
  const [departments, setDepartments] = useState<Department[] | null>(null)

  useEffect(() => {
    fetchDepartments().then((page) => setDepartments(page.results))
  }, [])

  if (departments === null) return <p className="text-sm text-ink-400">Loading…</p>

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-2.5">Department</th>
            <th className="px-4 py-2.5">Branch</th>
            <th className="px-4 py-2.5">Employees</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {departments.map((d) => (
            <tr key={d.id}>
              <td className="px-4 py-2.5 font-medium text-ink-800">{d.name}</td>
              <td className="px-4 py-2.5 text-ink-600">{d.branch_name}</td>
              <td className="px-4 py-2.5 text-ink-600">{d.employee_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
