import { apiGet, type PagedResponse } from '@/lib/api'
import type { Department, Designation, Employee, OrgCompanyNode, Team } from '@/modules/hrms/employees/types'

interface EmployeesPageRequest {
  limit: number
  offset: number
  ordering?: string
  search?: string
  department?: string
  team?: string
  status?: string
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  return search.toString()
}

export function fetchEmployeesPage(request: EmployeesPageRequest): Promise<PagedResponse<Employee>> {
  return apiGet<PagedResponse<Employee>>(`/api/hrms/employees/?${toQueryString({ ...request })}`)
}

export function fetchAllEmployees(): Promise<PagedResponse<Employee>> {
  return apiGet<PagedResponse<Employee>>('/api/hrms/employees/?limit=200')
}

// Departments/Teams/Designations use the project-wide default pagination
// (PageNumberPagination, PAGE_SIZE=25) rather than GridPagination — these
// are small catalog tables, not AG-Grid views. No page param here: this
// only shows page 1 (25 rows), which is every org this session's demo
// data has — add a page control if a real org ever exceeds that.
export function fetchDepartments(): Promise<PagedResponse<Department>> {
  return apiGet('/api/hrms/departments/')
}

export function fetchTeams(): Promise<PagedResponse<Team>> {
  return apiGet('/api/hrms/teams/')
}

export function fetchDesignations(): Promise<PagedResponse<Designation>> {
  return apiGet('/api/hrms/designations/')
}

export function fetchOrgStructure(): Promise<OrgCompanyNode[]> {
  return apiGet<OrgCompanyNode[]>('/api/hrms/org-structure/')
}
