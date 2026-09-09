import { useEffect, useState } from 'react'

import { fetchTeams } from '@/modules/hrms/employees/data'
import type { Team } from '@/modules/hrms/employees/types'

export function TeamsView() {
  const [teams, setTeams] = useState<Team[] | null>(null)

  useEffect(() => {
    fetchTeams().then((page) => setTeams(page.results))
  }, [])

  if (teams === null) return <p className="text-sm text-ink-400">Loading…</p>

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-2.5">Team</th>
            <th className="px-4 py-2.5">Department</th>
            <th className="px-4 py-2.5">Members</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {teams.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-2.5 font-medium text-ink-800">{t.name}</td>
              <td className="px-4 py-2.5 text-ink-600">{t.department_name}</td>
              <td className="px-4 py-2.5 text-ink-600">{t.employee_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
