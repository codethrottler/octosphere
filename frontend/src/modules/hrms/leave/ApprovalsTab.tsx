import { useEffect, useState } from 'react'

import { Check, X } from 'lucide-react'

import { approveLeaveRequest, fetchLeaveRequests, rejectLeaveRequest } from '@/modules/hrms/leave/data'
import type { LeaveRequest } from '@/modules/hrms/leave/types'
import { Badge, type BadgeTone } from '@/widgets/Badge'

const STATUS_TONE: Record<LeaveRequest['approval_status'], BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
}

/** My direct reports' leave requests, approve/reject via core.ApprovalRequest (see docs/ARCHITECTURE.md). */
export function ApprovalsTab() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])

  function reload() {
    fetchLeaveRequests({ limit: 50, offset: 0, scope: 'team' }).then((page) => setRequests(page.results))
  }

  useEffect(reload, [])

  async function handleDecision(id: number, approved: boolean) {
    await (approved ? approveLeaveRequest(id) : rejectLeaveRequest(id))
    reload()
  }

  if (requests.length === 0) {
    return <p className="text-sm text-ink-400">No leave requests from your team.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
          <div>
            <p className="text-sm font-medium text-ink-900">
              {r.employee_name} · {r.leave_type_name}
            </p>
            <p className="text-xs text-ink-500">
              {r.start_date} → {r.end_date} ({r.days_requested} days) — {r.reason || 'No reason given'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[r.approval_status]}>{r.approval_status}</Badge>
            {r.approval_status === 'pending' ? (
              <>
                <button type="button" onClick={() => handleDecision(r.id, true)} className="rounded-lg p-1.5 text-success-700 hover:bg-success-50">
                  <Check className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDecision(r.id, false)} className="rounded-lg p-1.5 text-danger-700 hover:bg-danger-50">
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
