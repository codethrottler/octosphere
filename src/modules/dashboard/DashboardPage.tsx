import type { ComponentType } from 'react'

import { useSearchParams } from 'react-router-dom'

import { useSession } from '@/app/session/SessionContext'
import { DEFAULT_DASHBOARD_TAB, dashboardTabs } from '@/modules/dashboard/dashboard.config'
import { ExecutiveOverviewTab } from '@/modules/dashboard/tabs/ExecutiveOverviewTab'
import { HrOverviewTab } from '@/modules/dashboard/tabs/HrOverviewTab'
import { MyOverviewTab } from '@/modules/dashboard/tabs/MyOverviewTab'
import { NotificationsAlertsTab } from '@/modules/dashboard/tabs/NotificationsAlertsTab'
import { ServiceDeskOverviewTab } from '@/modules/dashboard/tabs/ServiceDeskOverviewTab'
import { TaskOverviewTab } from '@/modules/dashboard/tabs/TaskOverviewTab'
import { TeamOverviewTab } from '@/modules/dashboard/tabs/TeamOverviewTab'
import { PermissionGate } from '@/shared/components/PermissionGate/PermissionGate'
import { Tabs } from '@/shared/components/Tabs/Tabs'

const TAB_PANELS: Record<string, ComponentType> = {
  executive: ExecutiveOverviewTab,
  my: MyOverviewTab,
  team: TeamOverviewTab,
  hr: HrOverviewTab,
  task: TaskOverviewTab,
  'service-desk': ServiceDeskOverviewTab,
  notifications: NotificationsAlertsTab,
}

/**
 * The Unified Dashboard: one landing page, one level above the 5 module
 * icons, with the 7 sub-pages implemented as tabs on this single route
 * (?tab=<id>) rather than separate nested routes.
 */
export function DashboardPage() {
  const { hasRole } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()

  const requestedTab = searchParams.get('tab')
  const activeId = dashboardTabs.some((tab) => tab.id === requestedTab) ? requestedTab! : DEFAULT_DASHBOARD_TAB

  const activeTab = dashboardTabs.find((tab) => tab.id === activeId)!
  const Panel = TAB_PANELS[activeId]
  const isAllowed = !activeTab.requiresAnyRole || hasRole(...activeTab.requiresAnyRole)
  const gateMessage = activeTab.requiresAnyRole
    ? `${activeTab.label} is only visible to ${activeTab.requiresAnyRole.join(' or ')} roles.`
    : undefined

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-400">A single view across HR, work, tickets, and alerts.</p>
      </div>

      <Tabs
        tabs={dashboardTabs}
        activeId={activeId}
        onChange={(id) => setSearchParams((prev) => ({ ...Object.fromEntries(prev), tab: id }))}
      />

      <PermissionGate allow={isAllowed} message={gateMessage}>
        <Panel />
      </PermissionGate>
    </div>
  )
}
