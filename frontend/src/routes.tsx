import type { ComponentType } from 'react'

import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { ComingSoonPage } from '@/common/ComingSoonPage'
import { EmployeesPage } from '@/modules/hrms/employees/EmployeesPage'
import { HrmsOverviewPage } from '@/modules/hrms/HrmsOverviewPage'
import { moduleNav } from '@/shell/nav.config'

/**
 * Real pages built so far, keyed by "<moduleId>/<pageId>". Anything not
 * in this map resolves to ComingSoonPage — add an entry here as each
 * page gets built; the routing shape itself never changes. See
 * docs/ARCHITECTURE.md.
 */
const PAGE_REGISTRY: Record<string, ComponentType> = {
  'hrms/overview': HrmsOverviewPage,
  'hrms/employees': EmployeesPage,
}

function ModulePage() {
  const { moduleId, pageId } = useParams<{ moduleId: string; pageId: string }>()
  const activeModule = moduleNav.find((m) => m.id === moduleId)

  if (!activeModule) return <Navigate to="/hrms/overview" replace />

  const Page = PAGE_REGISTRY[`${activeModule.id}/${pageId}`]
  if (Page) return <Page />

  const page = activeModule.sidebar.find((s) => s.id === pageId) ?? activeModule.sidebar[0]
  return <ComingSoonPage moduleLabel={activeModule.label} pageLabel={page.label} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/hrms/overview" replace />} />
      {moduleNav.map((m) => (
        <Route key={m.id} path={m.path} element={<Navigate to={`${m.path}/overview`} replace />} />
      ))}
      <Route path="/:moduleId/:pageId" element={<ModulePage />} />
      <Route path="*" element={<Navigate to="/hrms/overview" replace />} />
    </Routes>
  )
}
