export interface Employee {
  id: number
  employee_code: string | null
  name: string
  email: string
  title: string
  designation_name: string | null
  department_name: string | null
  team_name: string | null
  branch_name: string | null
  manager_name: string | null
  employment_status: string
  date_joined_company: string | null
  phone_number: string
  work_location: string
}

export interface Department {
  id: number
  name: string
  code: string
  branch: number
  branch_name: string
  employee_count: number
}

export interface Team {
  id: number
  name: string
  code: string
  department: number
  department_name: string
  employee_count: number
}

export interface Designation {
  id: number
  name: string
  code: string
  level: number
}

export interface OrgTeamNode {
  id: number
  name: string
  employee_count: number
}

export interface OrgDepartmentNode {
  id: number
  name: string
  teams: OrgTeamNode[]
}

export interface OrgBranchNode {
  id: number
  name: string
  departments: OrgDepartmentNode[]
}

export interface OrgCompanyNode {
  id: number
  name: string
  branches: OrgBranchNode[]
}
