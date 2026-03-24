import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useResume } from '@/context/resume-context'
import type { CertificationsSection, CertificationEntry } from '@/types/resume'

interface CertificationsEditorProps {
  section: CertificationsSection
  onClose: () => void
}

export function CertificationsEditor({ section, onClose }: CertificationsEditorProps) {
  const { dispatch } = useResume()
  const [entries, setEntries] = useState<CertificationEntry[]>(section.entries.map((e) => ({ ...e })))

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SECTION', payload: { sectionId: section.id, data: { entries } } })
  }

  useEffect(() => {
    const listener = () => handleSave()
    document.addEventListener('save-editor', listener)
    return () => document.removeEventListener('save-editor', listener)
  })

  const addEntry = () => {
    setEntries([...entries, { id: crypto.randomUUID(), name: '', issuer: '', date: '' }])
  }

  const removeEntry = (id: string) => setEntries(entries.filter((e) => e.id !== id))

  const updateEntry = (id: string, field: keyof CertificationEntry, value: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold text-foreground">Edit Certifications</span>
        <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <ScrollArea className="flex-1 px-6">
        <div className="flex flex-col gap-4 pb-4">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="flex flex-col gap-3">
              {idx > 0 && <Separator />}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Certification {idx + 1}</span>
                <button onClick={() => removeEntry(entry.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Certification Name</Label>
                <Input value={entry.name} onChange={(e) => updateEntry(entry.id, 'name', e.target.value)} className="text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Issuer</Label>
                <Input value={entry.issuer} onChange={(e) => updateEntry(entry.id, 'issuer', e.target.value)} className="text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input value={entry.date} onChange={(e) => updateEntry(entry.id, 'date', e.target.value)} className="text-sm" />
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addEntry} className="w-full"><Plus className="mr-1 h-3.5 w-3.5" />Add Certification</Button>
        </div>
      </ScrollArea>
      <div className="flex gap-3 border-t border-[#E8E8E8] px-6 py-4">
        <Button size="sm" onClick={handleSave}>Save Changes</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}
