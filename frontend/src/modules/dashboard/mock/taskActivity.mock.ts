import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'

import type { ActivityItem } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'

/** Recently completed/overdue tasks for the Task Overview tab. Isolated mock, swap for a real feed once My Work lands. */
export const taskActivityMock: ActivityItem[] = [
  { id: 'tsk_a1', description: '"Migrate CI pipeline" marked complete — Engineering.', timestamp: '20m ago', icon: CheckCircle2 },
  { id: 'tsk_a2', description: '"Vendor contract renewal" is now 5 days overdue.', timestamp: '1h ago', icon: AlertTriangle },
  { id: 'tsk_a3', description: '"Client onboarding call" moved to In Progress.', timestamp: '2h ago', icon: Clock3 },
  { id: 'tsk_a4', description: '"Q3 budget review" is now 3 days overdue.', timestamp: '4h ago', icon: AlertTriangle },
]
