import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { ComingSoonPage } from '@/common/ComingSoonPage'
import { HrmsOverviewPage } from '@/modules/hrms/HrmsOverviewPage'
import { moduleNav } from '@/shell/nav.config'

/**
 * hrms/overview is the only page with a real component this session —
 * everything else in the sidebar resolves here to ComingSoonPage. Add a
 * case above the fallback as each page gets built; nothing about the
 * routing shape needs to change.
 */
function ModulePage() {
  const { moduleId, pageId } = useParams<{ moduleId: string; pageId: string }>()
  const activeModule = moduleNav.find((m) => m.id === moduleId)

  if (!activeModule) return <Navigate to="/hrms/overview" replace />

  if (activeModule.id === 'hrms' && pageId === 'overview') {
    return <HrmsOverviewPage />
  }

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
