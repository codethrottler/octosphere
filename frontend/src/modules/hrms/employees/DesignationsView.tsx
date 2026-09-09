import { useEffect, useState } from 'react'

import { fetchDesignations } from '@/modules/hrms/employees/data'
import type { Designation } from '@/modules/hrms/employees/types'

export function DesignationsView() {
  const [designations, setDesignations] = useState<Designation[] | null>(null)

  useEffect(() => {
    fetchDesignations().then((page) => setDesignations(page.results))
  }, [])

  if (designations === null) return <p className="text-sm text-ink-400">Loading…</p>

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-2.5">Designation</th>
            <th className="px-4 py-2.5">Code</th>
            <th className="px-4 py-2.5">Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {designations.map((d) => (
            <tr key={d.id}>
              <td className="px-4 py-2.5 font-medium text-ink-800">{d.name}</td>
              <td className="px-4 py-2.5 text-ink-600">{d.code}</td>
              <td className="px-4 py-2.5 text-ink-600">{d.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
