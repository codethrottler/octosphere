import { LogOut, UserCheck, UserPlus } from 'lucide-react'

import type { ActivityItem } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'

/** Recent HR activity for the HR Overview tab. Isolated mock, swap for a real feed once HRMS lands. */
export const hrActivityMock: ActivityItem[] = [
  { id: 'hr_1', description: 'Neha Kapoor started onboarding — starts Sep 15.', timestamp: '1h ago', icon: UserPlus },
  { id: 'hr_2', description: 'Probation review completed for Daniel Osei.', timestamp: '3h ago', icon: UserCheck },
  { id: 'hr_3', description: 'Exit process initiated for Marcus Webb.', timestamp: 'Yesterday', icon: LogOut },
]
