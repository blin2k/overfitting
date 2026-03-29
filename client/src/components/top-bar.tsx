import { Save, Download, Bot, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  currentPage?: 'builder' | 'settings'
  onSave?: () => void
  onExport?: () => void
}

export function TopBar({ currentPage = 'builder', onSave, onExport }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-3">
      <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Overfitting
      </span>
      <div className="flex-1" />
      {currentPage === 'builder' ? (
        <>
          <Button size="sm" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Project
          </Button>
          <Button size="sm" variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link to="/settings">
            <Button size="sm" variant="ghost">
              <Bot className="h-4 w-4" />
            </Button>
          </Link>
        </>
      ) : (
        <Link to="/builder">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
        </Link>
      )}
    </div>
  )
}
