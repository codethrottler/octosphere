import { Bell, Briefcase, CheckSquare, Globe2, Ticket, User, Users } from 'lucide-react'

import type { Role } from '@/app/session/types'
import type { TabItem } from '@/shared/components/Tabs/Tabs'

export interface DashboardTabConfig extends TabItem {
  /** Any one of these roles grants access; omitted means everyone can view it. */
  requiresAnyRole?: Role[]
}

export const dashboardTabs: DashboardTabConfig[] = [
  { id: 'executive', label: 'Executive Overview', icon: Globe2 },
  { id: 'my', label: 'My Overview', icon: User },
  { id: 'team', label: 'Team Overview', icon: Users, requiresAnyRole: ['manager', 'admin'] },
  { id: 'hr', label: 'HR Overview', icon: Briefcase, requiresAnyRole: ['hr', 'admin'] },
  { id: 'task', label: 'Task Overview', icon: CheckSquare },
  { id: 'service-desk', label: 'Service Desk Overview', icon: Ticket },
  { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
]

export const DEFAULT_DASHBOARD_TAB = dashboardTabs[0].id
