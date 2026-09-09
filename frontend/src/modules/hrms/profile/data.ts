import { apiDelete, apiGet, apiPatch, apiPost, apiPut, apiUpload } from '@/lib/api'
import type { BankAccount, EmergencyContact, EmployeeProfile, EmployeeSkill, ProfileDocument, Qualification } from '@/modules/hrms/profile/types'

export function fetchMyProfile(): Promise<EmployeeProfile> {
  return apiGet<EmployeeProfile>('/api/hrms/profile/me/')
}

export function updateMyProfile(patch: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
  return apiPatch<EmployeeProfile>('/api/hrms/profile/me/', patch)
}

export function saveBankAccount(data: Omit<BankAccount, 'updated_at'>): Promise<BankAccount> {
  return apiPut<BankAccount>('/api/hrms/bank-account/me/', data)
}

export function createEmergencyContact(data: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
  return apiPost<EmergencyContact>('/api/hrms/emergency-contacts/', data)
}

export function deleteEmergencyContact(id: number): Promise<void> {
  return apiDelete(`/api/hrms/emergency-contacts/${id}/`)
}

export function createSkill(data: { skill_name_input: string; proficiency: string; years_of_experience?: number }): Promise<EmployeeSkill> {
  return apiPost<EmployeeSkill>('/api/hrms/skills/', data)
}

export function deleteSkill(id: number): Promise<void> {
  return apiDelete(`/api/hrms/skills/${id}/`)
}

export function createQualification(data: Omit<Qualification, 'id'>): Promise<Qualification> {
  return apiPost<Qualification>('/api/hrms/qualifications/', data)
}

export function deleteQualification(id: number): Promise<void> {
  return apiDelete(`/api/hrms/qualifications/${id}/`)
}

export function uploadDocument(documentType: string, file: File): Promise<ProfileDocument> {
  const formData = new FormData()
  formData.append('document_type', documentType)
  formData.append('file', file)
  formData.append('original_filename', file.name)
  return apiUpload<ProfileDocument>('/api/hrms/documents/', formData)
}

export function deleteDocument(id: number): Promise<void> {
  return apiDelete(`/api/hrms/documents/${id}/`)
}
