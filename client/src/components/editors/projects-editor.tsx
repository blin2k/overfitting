import { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useResume } from '@/context/resume-context'
import type { ProjectsSection, ProjectEntry } from '@/types/resume'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'
import { cn } from '@/lib/utils'

interface ProjectsEditorProps {
  section: ProjectsSection
  onClose: () => void
}

function SortableProjectCard({
  entry,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  entry: ProjectEntry
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (field: keyof ProjectEntry, value: string) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border bg-background"
    >
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
        onClick={onToggle}
      >
        <button
          type="button"
          className="cursor-grab hover:text-foreground text-muted-foreground"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
            isExpanded && 'rotate-90',
          )}
        />
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          {entry.name || 'Untitled Project'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="rounded p-1 hover:bg-muted"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-3 border-t border-border px-3 py-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Project Name</Label>
            <Input
              value={entry.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={entry.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">URL (optional)</Label>
            <Input
              value={entry.url ?? ''}
              onChange={(e) => onUpdate('url', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function ProjectsEditor({ section, onClose }: ProjectsEditorProps) {
  const { dispatch } = useResume()
  const [entries, setEntries] = useState<ProjectEntry[]>(section.entries.map((e) => ({ ...e })))
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SECTION', payload: { sectionId: section.id, data: { entries } } })
  }

  useEffect(() => {
    const listener = () => handleSave()
    document.addEventListener('save-editor', listener)
    return () => document.removeEventListener('save-editor', listener)
  })

  const addEntry = () => {
    const id = crypto.randomUUID()
    setEntries([...entries, { id, name: '', description: '' }])
    setExpandedId(id)
  }

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const updateEntry = (id: string, field: keyof ProjectEntry, value: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((e) => e.id === active.id)
      const newIndex = entries.findIndex((e) => e.id === over.id)
      setEntries(arrayMove(entries, oldIndex, newIndex))
    }
  }

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold text-foreground">Edit Projects</span>
        <button onClick={onClose} className="rounded p-1 hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <ScrollArea className="flex-1 px-6">
        <div className="flex flex-col gap-2 pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <SortableContext
              items={entries.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              {entries.map((entry) => (
                <SortableProjectCard
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedId === entry.id}
                  onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  onUpdate={(field, value) => updateEntry(entry.id, field, value)}
                  onRemove={() => removeEntry(entry.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button size="sm" variant="outline" onClick={addEntry} className="w-full">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Project
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
