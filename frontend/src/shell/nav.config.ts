import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  Clock,
  Download,
  FileBarChart,
  FileSearch,
  FileText,
  FolderKanban,
  Headset,
  LayoutDashboard,
  Presentation,
  Server,
  Settings,
  Settings2,
  ShieldCheck,
  Sliders,
  Ticket,
  TrendingUp,
  UserCog,
  Users,
  Workflow,
} from 'lucide-react'

import type { ComponentType } from 'react'

export interface SidebarItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export interface ModuleNavEntry {
  id: string
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
  sidebar: SidebarItem[]
}

/**
 * The 5 modules, their icon-rail icon, and their labeled-sidebar sub-nav —
 * driven by the full OctoSphere sitemap. Every module gets an "Overview"
 * as its first sidebar item (its dashboard landing page); only
 * hrms/overview has a real page behind it this session, everything else
 * renders ComingSoonPage. See docs/MODULE_PLAN.md for build status.
 */
export const moduleNav: ModuleNavEntry[] = [
  {
    id: 'hrms',
    label: 'HRMS',
    path: '/hrms',
    icon: Users,
    sidebar: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'my-profile', label: 'My Profile', icon: Users },
      { id: 'employees', label: 'Employees', icon: Users },
      { id: 'attendance', label: 'Attendance', icon: Clock },
      { id: 'leave', label: 'Leave', icon: CalendarDays },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'performance', label: 'Performance', icon: TrendingUp },
      { id: 'hr-administration', label: 'HR Administration', icon: Settings2 },
    ],
  },
  {
    id: 'my-work',
    label: 'My Work',
    path: '/my-work',
    icon: CheckSquare,
    sidebar: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare },
      { id: 'projects', label: 'Projects', icon: FolderKanban },
      { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
      { id: 'team-work', label: 'Team Work', icon: Users },
      { id: 'my-calendar', label: 'My Calendar', icon: Calendar },
    ],
  },
  {
    id: 'service-desk',
    label: 'Service Desk',
    path: '/service-desk',
    icon: Headset,
    sidebar: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'hr-desk', label: 'HR Desk', icon: Briefcase },
      { id: 'it-desk', label: 'IT & Network Desk', icon: Server },
      { id: 'admin-desk', label: 'Admin Desk', icon: Building2 },
      { id: 'ticket-management', label: 'Ticket Management', icon: Ticket },
      { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
      { id: 'service-reports', label: 'Service Reports', icon: FileBarChart },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    path: '/reports',
    icon: BarChart3,
    sidebar: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'executive-reports', label: 'Executive Reports', icon: Presentation },
      { id: 'hr-analytics', label: 'HR Analytics', icon: Users },
      { id: 'workforce-analytics', label: 'Workforce Analytics', icon: Activity },
      { id: 'task-productivity', label: 'Task & Productivity', icon: CheckSquare },
      { id: 'service-desk-analytics', label: 'Service Desk Analytics', icon: Headset },
      { id: 'custom-reports', label: 'Custom Reports', icon: FileBarChart },
      { id: 'scheduled-reports', label: 'Scheduled Reports', icon: CalendarClock },
      { id: 'export-center', label: 'Export Center', icon: Download },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    path: '/administration',
    icon: Settings,
    sidebar: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'organization', label: 'Organization', icon: Building2 },
      { id: 'user-management', label: 'User Management', icon: UserCog },
      { id: 'workflow-management', label: 'Workflow Management', icon: Workflow },
      { id: 'service-desk-configuration', label: 'Service Desk Configuration', icon: Settings2 },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'system-settings', label: 'System Settings', icon: Sliders },
      { id: 'security', label: 'Security', icon: ShieldCheck },
      { id: 'audit-compliance', label: 'Audit & Compliance', icon: FileSearch },
      { id: 'system-monitoring', label: 'System Monitoring', icon: Activity },
    ],
  },
]
