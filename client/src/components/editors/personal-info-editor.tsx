import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useResume } from '@/context/resume-context'
import type { PersonalInfo } from '@/types/resume'

interface PersonalInfoEditorProps {
  onClose: () => void
}

export function PersonalInfoEditor({ onClose }: PersonalInfoEditorProps) {
  const { state, dispatch } = useResume()
  const [form, setForm] = useState<PersonalInfo>({ ...state.personalInfo })

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: form })
  }

  useEffect(() => {
    const listener = () => handleSave()
    document.addEventListener('save-editor', listener)
    return () => document.removeEventListener('save-editor', listener)
  })

  const fields: { key: keyof PersonalInfo; label: string }[] = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'linkedinUrl', label: 'LinkedIn URL' },
    { key: 'portfolioWebsite', label: 'Portfolio Website' },
  ]

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold text-foreground">Edit Personal Info</span>
        <button onClick={onClose} className="rounded p-1 hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Form */}
      <ScrollArea className="flex-1 px-6">
        <div className="flex flex-col gap-4 pb-4">
          {fields.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label htmlFor={key} className="text-xs text-muted-foreground">
                {label}
              </Label>
              <Input
                id={key}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex gap-3 border-t border-[#E8E8E8] px-6 py-4">
        <Button size="sm" onClick={handleSave}>
          Save Changes
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
