import { useState } from 'react'

import { DepartmentsView } from '@/modules/hrms/employees/DepartmentsView'
import { DesignationsView } from '@/modules/hrms/employees/DesignationsView'
import { DirectoryView } from '@/modules/hrms/employees/DirectoryView'
import { EmployeeListView } from '@/modules/hrms/employees/EmployeeListView'
import { OrgStructureView } from '@/modules/hrms/employees/OrgStructureView'
import { TeamsView } from '@/modules/hrms/employees/TeamsView'
import { PageHeader } from '@/shell/PageHeader'
import { SubTabs } from '@/widgets/SubTabs'

const TABS = [
  { id: 'directory', label: 'Directory' },
  { id: 'list', label: 'List' },
  { id: 'org-structure', label: 'Org Structure' },
  { id: 'departments', label: 'Departments' },
  { id: 'designations', label: 'Designations' },
  { id: 'teams', label: 'Teams' },
] as const

type TabId = (typeof TABS)[number]['id']

/** One sidebar entry ("Employees"), six internal views — see widgets/SubTabs.tsx. */
export function EmployeesPage() {
  const [tab, setTab] = useState<TabId>('directory')

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Employees" />
      <SubTabs tabs={TABS} activeId={tab} onChange={(id) => setTab(id as TabId)} />
      <div className="min-h-0 flex-1">
        {tab === 'directory' && <DirectoryView />}
        {tab === 'list' && <EmployeeListView />}
        {tab === 'org-structure' && <OrgStructureView />}
        {tab === 'departments' && <DepartmentsView />}
        {tab === 'designations' && <DesignationsView />}
        {tab === 'teams' && <TeamsView />}
      </div>
    </div>
  )
}
