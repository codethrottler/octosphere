import { useEffect, useState } from 'react'

import { BankTab } from '@/modules/hrms/profile/BankTab'
import { ContactTab } from '@/modules/hrms/profile/ContactTab'
import { DocumentsTab } from '@/modules/hrms/profile/DocumentsTab'
import { EmergencyContactsTab } from '@/modules/hrms/profile/EmergencyContactsTab'
import { EmploymentTab } from '@/modules/hrms/profile/EmploymentTab'
import { PersonalTab } from '@/modules/hrms/profile/PersonalTab'
import { SkillsQualificationsTab } from '@/modules/hrms/profile/SkillsQualificationsTab'
import { fetchMyProfile } from '@/modules/hrms/profile/data'
import type { EmployeeProfile } from '@/modules/hrms/profile/types'
import { PageHeader } from '@/shell/PageHeader'
import { SubTabs } from '@/widgets/SubTabs'

const TABS = [
  { id: 'personal', label: 'Personal' },
  { id: 'contact', label: 'Contact' },
  { id: 'employment', label: 'Employment' },
  { id: 'emergency', label: 'Emergency Contacts' },
  { id: 'bank', label: 'Bank / Payment' },
  { id: 'skills', label: 'Skills & Qualifications' },
  { id: 'documents', label: 'Documents' },
] as const

type TabId = (typeof TABS)[number]['id']

/**
 * The profile is fetched once here (EmployeeProfileSerializer nests
 * emergency contacts/bank account/skills/qualifications/documents in one
 * call) and passed down; every mutation refetches rather than juggling
 * per-tab cache state — simplest thing that works at this scale, per
 * docs/CONVENTIONS.md's "no state library until it's needed."
 */
export function MyProfilePage() {
  const [tab, setTab] = useState<TabId>('personal')
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)

  function reload() {
    fetchMyProfile().then(setProfile)
  }

  useEffect(reload, [])

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="My Profile" />
      <SubTabs tabs={TABS} activeId={tab} onChange={(id) => setTab(id as TabId)} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {profile === null ? (
          <p className="text-sm text-ink-400">Loading…</p>
        ) : (
          <>
            {tab === 'personal' && <PersonalTab profile={profile} onSaved={reload} />}
            {tab === 'contact' && <ContactTab profile={profile} onSaved={reload} />}
            {tab === 'employment' && <EmploymentTab profile={profile} />}
            {tab === 'emergency' && <EmergencyContactsTab contacts={profile.emergency_contacts} onChanged={reload} />}
            {tab === 'bank' && <BankTab bankAccount={profile.bank_account} onSaved={reload} />}
            {tab === 'skills' && (
              <SkillsQualificationsTab skills={profile.skills} qualifications={profile.qualifications} onChanged={reload} />
            )}
            {tab === 'documents' && <DocumentsTab documents={profile.documents} onChanged={reload} />}
          </>
        )}
      </div>
    </div>
  )
}
