export interface EmergencyContact {
  id: number
  name: string
  relationship: string
  phone_number: string
  alternate_phone_number: string
  is_primary: boolean
}

export interface BankAccount {
  account_holder_name: string
  bank_name: string
  branch_name: string
  account_number: string
  ifsc_code: string
  account_type: 'savings' | 'current'
  updated_at: string
}

export interface EmployeeSkill {
  id: number
  skill: number
  skill_name: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  years_of_experience: string | null
}

export interface Qualification {
  id: number
  title: string
  institution: string
  year_completed: number | null
}

export interface ProfileDocument {
  id: number
  document_type: string
  file: string
  original_filename: string
  uploaded_by_name: string | null
  uploaded_at: string
}

export interface EmployeeProfile {
  id: number
  date_of_birth: string | null
  gender: string
  marital_status: string
  nationality: string
  blood_group: string
  personal_email: string
  phone_number: string
  alternate_phone_number: string
  current_address: string
  permanent_address: string
  designation: number | null
  designation_name: string | null
  employment_type: string
  work_location: string
  confirmation_date: string | null
  emergency_contacts: EmergencyContact[]
  bank_account: BankAccount | null
  skills: EmployeeSkill[]
  qualifications: Qualification[]
  documents: ProfileDocument[]
  updated_at: string
}
