import { Pencil, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SectionRowProps {
  id: string
  title: string
  isActive: boolean
  onEdit: () => void
  onDelete?: () => void
  canDelete: boolean
  isSortable?: boolean
}

export function SectionRow({ id, title, isActive, onEdit, onDelete, canDelete, isSortable }: SectionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = isSortable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  } : undefined

  return (
    <div
      ref={isSortable ? setNodeRef : undefined}
      style={style}
      className={cn(
        'group flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer',
        'hover:bg-muted/50',
        isActive && 'border-l-2 border-l-red-500 bg-muted/50',
        !isActive && 'border-l-2 border-l-transparent',
      )}
      onClick={onEdit}
    >
      <div className="flex items-center gap-2">
        {isSortable && (
          <button
            type="button"
            className="cursor-grab hover:text-foreground text-muted-foreground mr-1"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <span className={cn('font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <button
          className="rounded p-1 hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {canDelete && onDelete && (
          <button
            className="rounded p-1 hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}
