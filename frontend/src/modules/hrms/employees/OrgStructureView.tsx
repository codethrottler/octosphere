import { useEffect, useState } from 'react'

import { Building2, Network, Users } from 'lucide-react'

import { fetchOrgStructure } from '@/modules/hrms/employees/data'
import type { OrgCompanyNode } from '@/modules/hrms/employees/types'

/** Read-only tree view of Company -> Branch -> Department -> Team with employee counts. */
export function OrgStructureView() {
  const [companies, setCompanies] = useState<OrgCompanyNode[] | null>(null)

  useEffect(() => {
    fetchOrgStructure().then(setCompanies)
  }, [])

  if (companies === null) {
    return <p className="text-sm text-ink-400">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {companies.map((company) => (
        <div key={company.id} className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Building2 className="h-4 w-4 text-brand-500" />
            {company.name}
          </div>
          <div className="flex flex-col gap-3 pl-4">
            {company.branches.map((branch) => (
              <div key={branch.id} className="border-l-2 border-ink-100 pl-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-700">
                  <Network className="h-3.5 w-3.5 text-ink-400" />
                  {branch.name}
                </div>
                <div className="flex flex-col gap-2 pl-4">
                  {branch.departments.map((department) => (
                    <div key={department.id} className="border-l-2 border-ink-100 pl-4">
                      <p className="mb-1 text-sm text-ink-600">{department.name}</p>
                      <ul className="flex flex-col gap-1 pl-4">
                        {department.teams.map((team) => (
                          <li key={team.id} className="flex items-center gap-1.5 text-xs text-ink-500">
                            <Users className="h-3 w-3 text-ink-400" />
                            {team.name}
                            <span className="text-ink-400">· {team.employee_count} {team.employee_count === 1 ? 'person' : 'people'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
