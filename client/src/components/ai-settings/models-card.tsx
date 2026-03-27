import { Circle, MessageSquare, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsCard } from './settings-card'

interface ModelConfig {
  providerId: string
  name: string
  icon: React.ReactNode
  label: string
  selectedModel: string
  options: string[]
}

const modelConfigs: ModelConfig[] = [
  {
    providerId: 'anthropic',
    name: 'Anthropic',
    icon: <Circle className="h-5 w-5" />,
    label: 'Default provider',
    selectedModel: 'Claude Opus 4',
    options: ['Claude Opus 4', 'Claude Sonnet 4', 'Claude Haiku 3.5'],
  },
  {
    providerId: 'openai',
    name: 'OpenAI',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Customized',
    selectedModel: 'GPT-4o',
    options: ['GPT-4o', 'GPT-4-turbo', 'GPT-3.5-turbo'],
  },
]

interface ModelsCardProps {
  providerModels: Record<string, string>
  onModelChange: (providerId: string, model: string) => void
  onSave: () => void
}

export function ModelsCard({ providerModels, onModelChange, onSave }: ModelsCardProps) {
  return (
    <SettingsCard
      id="models"
      title="Models"
      subtitle="Configure the default model for each connected AI provider."
    >
      <div className="flex flex-col gap-4">
        {modelConfigs.map((config) => (
          <div
            key={config.providerId}
            className="flex items-center justify-between rounded-lg py-2"
          >
            <div className="flex items-center gap-3">
              <div className="text-foreground">{config.icon}</div>
              <div>
                <div className="text-sm font-medium text-foreground">{config.name}</div>
                <div className="text-xs text-muted-foreground">{config.label}</div>
              </div>
            </div>
            <select
              value={providerModels[config.providerId] ?? config.selectedModel}
              onChange={(e) => onModelChange(config.providerId, e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
            >
              {config.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={onSave}>
            <Check className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </SettingsCard>
  )
}
