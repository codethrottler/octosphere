export interface AttendanceRecord {
  id: number
  employee: number
  employee_name: string
  date: string
  check_in: string | null
  check_out: string | null
  status: string
  notes: string
}

export interface AttendanceCorrection {
  id: number
  record: number
  employee_name: string
  record_date: string
  requested_by: number
  requested_check_in: string | null
  requested_check_out: string | null
  reason: string
  approval_status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  created_at: string
}
