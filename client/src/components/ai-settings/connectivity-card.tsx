import { Circle, MessageSquare, Sparkles, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SettingsCard } from './settings-card'

interface Provider {
  id: string
  name: string
  icon: React.ReactNode
  connected: boolean
}

const providers: Provider[] = [
  { id: 'anthropic', name: 'Anthropic', icon: <Circle className="h-5 w-5" />, connected: true },
  { id: 'openai', name: 'OpenAI', icon: <MessageSquare className="h-5 w-5" />, connected: true },
  { id: 'gemini', name: 'Gemini', icon: <Sparkles className="h-5 w-5" />, connected: false },
  { id: 'kimi', name: 'Kimi', icon: <Wind className="h-5 w-5" />, connected: false },
]

interface ConnectivityCardProps {
  selectedProvider: string
  onSelectProvider: (id: string) => void
}

export function ConnectivityCard({ selectedProvider, onSelectProvider }: ConnectivityCardProps) {
  return (
    <SettingsCard
      id="connectivity"
      title="Connectivity"
      subtitle="Show connection status"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelectProvider(provider.id)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
              selectedProvider === provider.id
                ? 'border-foreground bg-card'
                : 'border-border bg-card hover:border-muted-foreground/50'
            )}
          >
            <div className="flex w-full items-center justify-between">
              <div className="text-foreground">{provider.icon}</div>
              <div
                className={cn(
                  'h-4 w-4 rounded-full border-2',
                  selectedProvider === provider.id
                    ? 'border-foreground bg-foreground'
                    : 'border-muted-foreground/30'
                )}
              >
                {selectedProvider === provider.id && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-card" />
                  </div>
                )}
              </div>
            </div>
            <div className="w-full text-left">
              <div className="text-sm font-medium text-foreground">{provider.name}</div>
              <span
                className={cn(
                  'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  provider.connected
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {provider.connected ? 'Connected' : 'Not configured'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </SettingsCard>
  )
}
