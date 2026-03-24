import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useResume } from '@/context/resume-context'
import type { WorkExperienceSection, WorkEntry } from '@/types/resume'

interface WorkExperienceEditorProps {
  section: WorkExperienceSection
  onClose: () => void
}

export function WorkExperienceEditor({ section, onClose }: WorkExperienceEditorProps) {
  const { dispatch } = useResume()
  const [entries, setEntries] = useState<WorkEntry[]>(
    section.entries.map((e) => ({ ...e, bullets: [...e.bullets] })),
  )

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { sectionId: section.id, data: { entries } },
    })
  }

  useEffect(() => {
    const listener = () => handleSave()
    document.addEventListener('save-editor', listener)
    return () => document.removeEventListener('save-editor', listener)
  })

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: crypto.randomUUID(), title: '', company: '', startDate: '', endDate: '', current: false, bullets: [''] },
    ])
  }

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const updateEntry = (id: string, field: keyof WorkEntry, value: unknown) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold text-foreground">Edit Work Experience</span>
        <button onClick={onClose} className="rounded p-1 hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="flex flex-col gap-4 pb-4">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="flex flex-col gap-3">
              {idx > 0 && <Separator />}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Entry {idx + 1}</span>
                <button onClick={() => removeEntry(entry.id)} className="rounded p-1 hover:bg-muted">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Job Title</Label>
                <Input value={entry.title} onChange={(e) => updateEntry(entry.id, 'title', e.target.value)} className="text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Company</Label>
                <Input value={entry.company} onChange={(e) => updateEntry(entry.id, 'company', e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <Input value={entry.startDate} onChange={(e) => updateEntry(entry.id, 'startDate', e.target.value)} className="text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <Input value={entry.endDate} onChange={(e) => updateEntry(entry.id, 'endDate', e.target.value)} className="text-sm" placeholder={entry.current ? 'Present' : ''} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Bullet Points</Label>
                <Textarea
                  value={entry.bullets.join('\n')}
                  onChange={(e) => updateEntry(entry.id, 'bullets', e.target.value.split('\n'))}
                  className="min-h-[100px] text-sm"
                  placeholder="One bullet per line"
                />
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addEntry} className="w-full">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Entry
          </Button>
        </div>
      </ScrollArea>

      <div className="flex gap-3 border-t border-[#E8E8E8] px-6 py-4">
        <Button size="sm" onClick={handleSave}>Save Changes</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}
