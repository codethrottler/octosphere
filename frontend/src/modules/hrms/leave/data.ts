import { apiGet, apiPost, type PagedResponse } from '@/lib/api'
import type { LeaveBalance, LeaveRequest, LeaveType } from '@/modules/hrms/leave/types'

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  return search.toString()
}

export function fetchLeaveTypes(): Promise<PagedResponse<LeaveType>> {
  return apiGet<PagedResponse<LeaveType>>('/api/hrms/leave/types/')
}

export function fetchLeaveBalances(): Promise<PagedResponse<LeaveBalance>> {
  return apiGet<PagedResponse<LeaveBalance>>('/api/hrms/leave/balances/')
}

interface RequestsPageRequest {
  limit: number
  offset: number
  ordering?: string
  scope?: 'mine' | 'team'
}

export function fetchLeaveRequests(request: RequestsPageRequest): Promise<PagedResponse<LeaveRequest>> {
  const { scope, ...rest } = request
  return apiGet<PagedResponse<LeaveRequest>>(
    `/api/hrms/leave/requests/?${toQueryString({ ...rest, scope: scope === 'team' ? 'team' : undefined })}`,
  )
}

export function applyLeave(data: { leave_type: number; start_date: string; end_date: string; reason: string }): Promise<LeaveRequest> {
  return apiPost<LeaveRequest>('/api/hrms/leave/requests/', data)
}

export function approveLeaveRequest(id: number): Promise<LeaveRequest> {
  return apiPost<LeaveRequest>(`/api/hrms/leave/requests/${id}/approve/`)
}

export function rejectLeaveRequest(id: number): Promise<LeaveRequest> {
  return apiPost<LeaveRequest>(`/api/hrms/leave/requests/${id}/reject/`)
}
