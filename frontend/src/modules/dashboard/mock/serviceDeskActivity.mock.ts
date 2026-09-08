import { AlertOctagon, CheckCircle2, MessageCircle } from 'lucide-react'

import type { ActivityItem } from '@/shared/components/ActivityFeedCard/ActivityFeedCard'

/** SLA alerts and recent ticket activity for the Service Desk Overview tab. Isolated mock, swap once Service Desk lands. */
export const serviceDeskActivityMock: ActivityItem[] = [
  { id: 'sd_a1', description: 'IT-4021 "VPN access request" breached SLA by 2h 10m.', timestamp: '15m ago', icon: AlertOctagon },
  { id: 'sd_a2', description: 'HR-1188 "Payroll discrepancy" resolved by HR Desk.', timestamp: '45m ago', icon: CheckCircle2 },
  { id: 'sd_a3', description: 'New reply on AD-3390 "New laptop request".', timestamp: '1h ago', icon: MessageCircle },
  { id: 'sd_a4', description: 'IT-4033 "Email sync issue" approaching SLA deadline.', timestamp: '2h ago', icon: AlertOctagon },
]
