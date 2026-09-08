import { BarChart3, CheckSquare, Home, Settings, Ticket, Users } from 'lucide-react'

import type { ComponentType } from 'react'

export interface ModuleNavEntry {
  id: string
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
}

/**
 * The icon rail's top-level entries. "Home" is the Unified Dashboard — one
 * level above the 5 functional modules, not nested under any of them.
 */
export const moduleNav: ModuleNavEntry[] = [
  { id: 'home', label: 'Home', path: '/dashboard', icon: Home },
  { id: 'hrms', label: 'HRMS', path: '/hrms', icon: Users },
  { id: 'my-work', label: 'My Work', path: '/my-work', icon: CheckSquare },
  { id: 'service-desk', label: 'Service Desk', path: '/service-desk', icon: Ticket },
  { id: 'reports', label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { id: 'administration', label: 'Administration', path: '/administration', icon: Settings },
]
