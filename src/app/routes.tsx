import { Navigate, Route, Routes } from 'react-router-dom'

import { ModulePlaceholderPage } from '@/app/pages/ModulePlaceholderPage'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'

/** Central route table. Only Dashboard has real content this session — the rest are placeholders. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/hrms" element={<ModulePlaceholderPage title="HRMS" />} />
      <Route path="/my-work" element={<ModulePlaceholderPage title="My Work" />} />
      <Route path="/service-desk" element={<ModulePlaceholderPage title="Service Desk" />} />
      <Route path="/reports" element={<ModulePlaceholderPage title="Reports & Analytics" />} />
      <Route path="/administration" element={<ModulePlaceholderPage title="Administration" />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
