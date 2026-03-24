import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SectionRow } from '@/components/section-row'
import { AddSectionDropdown } from '@/components/add-section-dropdown'
import { useResume } from '@/context/resume-context'
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
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'

interface SectionSidebarProps {
  activeSection: string | null
  onSelectSection: (id: string | null) => void
}

export function SectionSidebar({ activeSection, onSelectSection }: SectionSidebarProps) {
  const { state, dispatch } = useResume()

  const handleDelete = (sectionId: string) => {
    dispatch({ type: 'REMOVE_SECTION', payload: { sectionId } })
    if (activeSection === sectionId) {
      onSelectSection(null)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sortedSections = [...state.sections].sort((a, b) => a.order - b.order)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedSections.findIndex((s) => s.id === active.id)
      const newIndex = sortedSections.findIndex((s) => s.id === over.id)
      
      const newlySorted = arrayMove(sortedSections, oldIndex, newIndex)
      dispatch({
        type: 'REORDER_SECTIONS',
        payload: { sectionIds: newlySorted.map(s => s.id) }
      })
    }
  }

  return (
    <div className="flex h-full flex-col border-r-0 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E8E8] px-6 py-5">
        <span className="text-sm font-semibold text-foreground">Resume Sections</span>
        <AddSectionDropdown onAdd={onSelectSection}>
          <Button size="sm" variant="default">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Section
          </Button>
        </AddSectionDropdown>
      </div>

      {/* Section List */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="flex flex-col gap-1">
          {/* Personal Info is always first and not deletable */}
          <SectionRow
            id="personal-info"
            title="Personal Info"
            isActive={activeSection === 'personal-info'}
            onEdit={() => onSelectSection('personal-info')}
            canDelete={false}
          />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <SortableContext
              items={sortedSections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedSections.map((section) => (
                <SectionRow
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  isActive={activeSection === section.id}
                  onEdit={() => onSelectSection(section.id)}
                  onDelete={() => handleDelete(section.id)}
                  canDelete
                  isSortable
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="flex justify-center border-t border-[#E8E8E8] px-6 py-4">
        <AddSectionDropdown onAdd={onSelectSection}>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            + Add Section
          </button>
        </AddSectionDropdown>
      </div>
    </div>
  )
}
