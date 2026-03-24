import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useResume } from '@/context/resume-context'
import type { CustomSection } from '@/types/resume'

interface CustomSectionEditorProps {
  section: CustomSection
  onClose: () => void
}

export function CustomSectionEditor({ section, onClose }: CustomSectionEditorProps) {
  const { dispatch } = useResume()
  const [title, setTitle] = useState(section.title)
  const [content, setContent] = useState(section.content)

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SECTION', payload: { sectionId: section.id, data: { title, content } } })
  }

  useEffect(() => {
    const listener = () => handleSave()
    document.addEventListener('save-editor', listener)
    return () => document.removeEventListener('save-editor', listener)
  })

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold text-foreground">Edit Custom Section</span>
        <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <ScrollArea className="flex-1 px-6">
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Section Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Content</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px] text-sm" />
          </div>
        </div>
      </ScrollArea>
      <div className="flex gap-3 border-t border-[#E8E8E8] px-6 py-4">
        <Button size="sm" onClick={handleSave}>Save Changes</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}
