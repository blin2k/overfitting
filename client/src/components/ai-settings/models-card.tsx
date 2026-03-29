import { SettingsCard } from './settings-card'
import type { ProviderConfig } from '@/lib/api'

interface ModelsCardProps {
  configuredProviders: ProviderConfig[]
  providerModels: Record<string, string>
  onModelChange: (providerId: string, model: string) => void
}

export function ModelsCard({ configuredProviders, providerModels, onModelChange }: ModelsCardProps) {
  return (
    <SettingsCard
      id="models"
      title="Models"
      subtitle="Configure the default model for each connected AI provider."
    >
      {configuredProviders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No providers configured. Add an API key to configure models.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {configuredProviders.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-lg py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                  {provider.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{provider.name}</div>
                </div>
              </div>
              <select
                value={providerModels[provider.id] ?? provider.defaultModel}
                onChange={(e) => onModelChange(provider.id, e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
              >
                {provider.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  )
}
