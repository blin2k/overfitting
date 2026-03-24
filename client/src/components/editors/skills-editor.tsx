import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useResume } from '@/context/resume-context'
import type { SkillsSection, SkillCategory } from '@/types/resume'

interface SkillsEditorProps {
  section: SkillsSection
  onClose: () => void
}

export function SkillsEditor({ section, onClose }: SkillsEditorProps) {
  const { dispatch } = useResume()
  const [categories, setCategories] = useState(
    section.categories.map((c) => ({ id: c.id, name: c.name, skillsText: c.skills.join(', ') })),
  )

  const handleSave = () => {
    const updatedCategories: SkillCategory[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      skills: c.skillsText.split(',').map((s) => s.trim()).filter(Boolean),
    }))
    dispatch({ type: 'UPDATE_SECTION', payload: { sectionId: section.id, data: { categories: updatedCategories } } })
  }

  useEffect(() => {
    const listener = () => handleSave()
    document.addEventListener('save-editor', listener)
    return () => document.removeEventListener('save-editor', listener)
  })

  const addCategory = () => {
    setCategories([...categories, { id: crypto.randomUUID(), name: '', skillsText: '' }])
  }

  const removeCategory = (id: string) => setCategories(categories.filter((c) => c.id !== id))

  const updateCategory = (id: string, field: 'name' | 'skillsText', value: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold text-foreground">Edit Skills</span>
        <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <ScrollArea className="flex-1 px-6">
        <div className="flex flex-col gap-4 pb-4">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="flex flex-col gap-3">
              {idx > 0 && <Separator />}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Category {idx + 1}</span>
                <button onClick={() => removeCategory(cat.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Category Name</Label>
                <Input value={cat.name} onChange={(e) => updateCategory(cat.id, 'name', e.target.value)} className="text-sm" placeholder="e.g. Languages" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Skills (comma-separated)</Label>
                <Input
                  value={cat.skillsText}
                  onChange={(e) => updateCategory(cat.id, 'skillsText', e.target.value)}
                  className="text-sm"
                  placeholder="TypeScript, React, Node.js"
                />
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addCategory} className="w-full"><Plus className="mr-1 h-3.5 w-3.5" />Add Category</Button>
        </div>
      </ScrollArea>
      <div className="flex gap-3 border-t border-[#E8E8E8] px-6 py-4">
        <Button size="sm" onClick={handleSave}>Save Changes</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}
