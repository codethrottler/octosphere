import { apiGet, apiPost, type PagedResponse } from '@/lib/api'
import type { AttendanceCorrection, AttendanceRecord } from '@/modules/hrms/attendance/types'

interface RecordsPageRequest {
  limit: number
  offset: number
  ordering?: string
  scope?: 'mine' | 'team'
  date_from?: string
  date_to?: string
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  return search.toString()
}

export function fetchAttendanceRecords(request: RecordsPageRequest): Promise<PagedResponse<AttendanceRecord>> {
  const { scope, ...rest } = request
  return apiGet<PagedResponse<AttendanceRecord>>(
    `/api/hrms/attendance/records/?${toQueryString({ ...rest, scope: scope === 'team' ? 'team' : undefined })}`,
  )
}

export function fetchMyRecentAttendance(): Promise<PagedResponse<AttendanceRecord>> {
  return apiGet<PagedResponse<AttendanceRecord>>('/api/hrms/attendance/records/?limit=31')
}

export function checkIn(): Promise<AttendanceRecord> {
  return apiPost<AttendanceRecord>('/api/hrms/attendance/check-in/')
}

export function checkOut(): Promise<AttendanceRecord> {
  return apiPost<AttendanceRecord>('/api/hrms/attendance/check-out/')
}

export function fetchCorrections(scope: 'mine' | 'team'): Promise<PagedResponse<AttendanceCorrection>> {
  return apiGet<PagedResponse<AttendanceCorrection>>(
    `/api/hrms/attendance/corrections/?${toQueryString({ scope: scope === 'team' ? 'team' : undefined })}`,
  )
}

export function requestCorrection(data: {
  record: number
  requested_check_in?: string
  requested_check_out?: string
  reason: string
}): Promise<AttendanceCorrection> {
  return apiPost<AttendanceCorrection>('/api/hrms/attendance/corrections/', data)
}

export function approveCorrection(id: number): Promise<AttendanceCorrection> {
  return apiPost<AttendanceCorrection>(`/api/hrms/attendance/corrections/${id}/approve/`)
}

export function rejectCorrection(id: number): Promise<AttendanceCorrection> {
  return apiPost<AttendanceCorrection>(`/api/hrms/attendance/corrections/${id}/reject/`)
}
