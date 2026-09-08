import { CheckCircle2, TicketX, UserPlus } from 'lucide-react'

import type { ActivityItem } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'

/** Org-wide activity feed for the Executive Overview tab. Isolated mock, swap for a real feed query later. */
export const executiveActivityMock: ActivityItem[] = [
  {
    id: 'evt_e1',
    description: 'Finance team completed Q3 budget review milestone.',
    timestamp: '25m ago',
    icon: CheckCircle2,
  },
  {
    id: 'evt_e2',
    description: '3 new employees onboarded in Engineering this week.',
    timestamp: '2h ago',
    icon: UserPlus,
  },
  {
    id: 'evt_e3',
    description: 'IT Desk SLA breach rate crossed 3% for the day.',
    timestamp: '3h ago',
    icon: TicketX,
  },
  {
    id: 'evt_e4',
    description: 'Sales department reached 92% task completion rate.',
    timestamp: '5h ago',
    icon: CheckCircle2,
  },
]
