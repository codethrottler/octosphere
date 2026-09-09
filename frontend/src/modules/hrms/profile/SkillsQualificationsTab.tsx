import { useState } from 'react'

import { Trash2 } from 'lucide-react'

import { Field } from '@/modules/hrms/profile/Field'
import { createQualification, createSkill, deleteQualification, deleteSkill } from '@/modules/hrms/profile/data'
import type { EmployeeSkill, Qualification } from '@/modules/hrms/profile/types'

interface SkillsQualificationsTabProps {
  skills: EmployeeSkill[]
  qualifications: Qualification[]
  onChanged: () => void
}

export function SkillsQualificationsTab({ skills, qualifications, onChanged }: SkillsQualificationsTabProps) {
  const [skillName, setSkillName] = useState('')
  const [proficiency, setProficiency] = useState('intermediate')
  const [qualTitle, setQualTitle] = useState('')
  const [qualInstitution, setQualInstitution] = useState('')
  const [qualYear, setQualYear] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAddSkill() {
    if (!skillName) return
    setSaving(true)
    try {
      await createSkill({ skill_name_input: skillName, proficiency })
      setSkillName('')
      onChanged()
    } finally {
      setSaving(false)
    }
  }

  async function handleAddQualification() {
    if (!qualTitle) return
    setSaving(true)
    try {
      await createQualification({ title: qualTitle, institution: qualInstitution, year_completed: qualYear ? Number(qualYear) : null })
      setQualTitle('')
      setQualInstitution('')
      setQualYear('')
      onChanged()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink-800">Skills</h3>
        <div className="flex flex-col gap-2">
          {skills.length === 0 ? (
            <p className="text-sm text-ink-400">No skills added yet.</p>
          ) : (
            skills.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2">
                <span className="text-sm text-ink-800">
                  {s.skill_name} <span className="text-xs text-ink-400">· {s.proficiency}</span>
                </span>
                <button type="button" onClick={() => deleteSkill(s.id).then(onChanged)} className="text-ink-400 hover:text-danger-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-ink-200 bg-white p-3">
          <input value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="Skill name" className="input" />
          <select value={proficiency} onChange={(e) => setProficiency(e.target.value)} className="input">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <button
            type="button"
            onClick={handleAddSkill}
            disabled={saving}
            className="w-fit rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            Add skill
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink-800">Qualifications</h3>
        <div className="flex flex-col gap-2">
          {qualifications.length === 0 ? (
            <p className="text-sm text-ink-400">No qualifications added yet.</p>
          ) : (
            qualifications.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2">
                <span className="text-sm text-ink-800">
                  {q.title} <span className="text-xs text-ink-400">· {q.institution} {q.year_completed}</span>
                </span>
                <button type="button" onClick={() => deleteQualification(q.id).then(onChanged)} className="text-ink-400 hover:text-danger-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-ink-200 bg-white p-3">
          <Field label="Title">
            <input value={qualTitle} onChange={(e) => setQualTitle(e.target.value)} className="input" placeholder="e.g. B.Sc. Computer Science" />
          </Field>
          <Field label="Institution">
            <input value={qualInstitution} onChange={(e) => setQualInstitution(e.target.value)} className="input" />
          </Field>
          <Field label="Year completed">
            <input value={qualYear} onChange={(e) => setQualYear(e.target.value)} className="input" type="number" />
          </Field>
          <button
            type="button"
            onClick={handleAddQualification}
            disabled={saving}
            className="w-fit rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            Add qualification
          </button>
        </div>
      </div>
    </div>
  )
}
