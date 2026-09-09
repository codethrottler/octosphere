export interface LeaveType {
  id: number
  name: string
  code: string
  annual_quota_days: string
  carry_forward_allowed: boolean
}

export interface LeaveBalance {
  id: number
  leave_type: number
  leave_type_name: string
  year: number
  allocated_days: string
  used_days: string
  remaining_days: string
}

export interface LeaveRequest {
  id: number
  employee: number
  employee_name: string
  leave_type: number
  leave_type_name: string
  start_date: string
  end_date: string
  days_requested: string
  reason: string
  approval_status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  created_at: string
}
