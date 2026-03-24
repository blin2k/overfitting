import { Save, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  onSave: () => void
  onExport: () => void
}

export function TopBar({ onSave, onExport }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-3">
      <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Overfitting
      </span>
      <div className="flex-1" />
      <Button size="sm" onClick={onSave}>
        <Save className="mr-2 h-4 w-4" />
        Save Project
      </Button>
      <Button size="sm" variant="outline" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  )
}
