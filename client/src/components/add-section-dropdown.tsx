import type { ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useResume } from '@/context/resume-context'
import type { SectionType } from '@/types/resume'

const ALL_SECTION_TYPES: { type: SectionType; label: string }[] = [
  { type: 'summary', label: 'Summary' },
  { type: 'work-experience', label: 'Work Experience' },
  { type: 'education', label: 'Education' },
  { type: 'skills', label: 'Skills' },
  { type: 'projects', label: 'Projects' },
  { type: 'certifications', label: 'Certifications' },
  { type: 'custom', label: 'Custom Section' },
]

interface AddSectionDropdownProps {
  children: ReactNode
  onAdd?: (id: string) => void
}

export function AddSectionDropdown({ children, onAdd }: AddSectionDropdownProps) {
  const { state, dispatch } = useResume()

  const existingTypes = new Set(state.sections.map((s) => s.type))

  // Custom sections can be added multiple times; others only once
  const availableSections = ALL_SECTION_TYPES.filter(
    (s) => s.type === 'custom' || !existingTypes.has(s.type),
  )

  const handleAdd = (sectionType: SectionType) => {
    // 1. Auto-save currently open editor
    document.dispatchEvent(new CustomEvent('save-editor'))

    // 2. Add new section
    const id = crypto.randomUUID()
    dispatch({ type: 'ADD_SECTION', payload: { sectionType, id } })

    // 3. Select it
    if (onAdd) {
      onAdd(id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children as React.ReactElement}>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {availableSections.length === 0 ? (
          <DropdownMenuItem disabled>All sections added</DropdownMenuItem>
        ) : (
          availableSections.map((s) => (
            <DropdownMenuItem key={s.type + s.label} onClick={() => handleAdd(s.type)}>
              {s.label}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
