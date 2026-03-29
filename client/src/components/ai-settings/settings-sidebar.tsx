import { Bot, House, SlidersHorizontal, Key, Cpu, Settings, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  enabled: boolean
}

const navItems: NavItem[] = [
  { id: 'connectivity', label: 'Connectivity', icon: <House className="h-4 w-4" />, enabled: true },
  { id: 'models', label: 'Models', icon: <SlidersHorizontal className="h-4 w-4" />, enabled: true },
  { id: 'api-keys', label: 'API Keys', icon: <Key className="h-4 w-4" />, enabled: true },
]

const disabledNavItems: NavItem[] = [
  { id: 'defaults', label: 'Default Settings', icon: <Cpu className="h-4 w-4" />, enabled: false },
  { id: 'preferences', label: 'Preferences', icon: <Settings className="h-4 w-4" />, enabled: false },
  { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" />, enabled: false },
]

interface SettingsSidebarProps {
  activeNav: string
  onNavChange: (id: string) => void
}

export function SettingsSidebar({ activeNav, onNavChange }: SettingsSidebarProps) {
  return (
    <div className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 px-4 py-4">
        <Bot className="h-5 w-5 text-foreground" />
        <div>
          <div className="text-sm font-semibold text-foreground">AI Studio</div>
          <div className="text-xs text-muted-foreground">Settings</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              activeNav === item.id
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="my-2 border-t border-border" />

        {disabledNavItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  )
}
