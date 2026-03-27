import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SettingsCard } from './settings-card'

interface ApiKeyEntry {
  providerId: string
  label: string
  verified: boolean
  placeholder: string
}

const apiKeyEntries: ApiKeyEntry[] = [
  {
    providerId: 'anthropic',
    label: 'Anthropic API Key',
    verified: true,
    placeholder: 'sk-ant-•••••••••••••••••3kF9',
  },
  {
    providerId: 'openai',
    label: 'OpenAI API Key',
    verified: true,
    placeholder: 'sk-proj-•••••••••••••••••7aWn',
  },
  {
    providerId: 'gemini',
    label: 'Gemini API Key',
    verified: false,
    placeholder: 'Enter your Gemini API key...',
  },
  {
    providerId: 'kimi',
    label: 'Kimi API Key',
    verified: false,
    placeholder: 'Enter your Kimi API key...',
  },
]

interface ApiKeysCardProps {
  apiKeys: Record<string, string>
  onApiKeyChange: (providerId: string, value: string) => void
  onTestKey: (providerId: string) => void
}

export function ApiKeysCard({ apiKeys, onApiKeyChange, onTestKey }: ApiKeysCardProps) {
  return (
    <SettingsCard
      id="api-keys"
      title="API Keys"
      subtitle="Enter your API keys for each provider. Keys are encrypted and stored securely."
    >
      <div className="flex flex-col gap-5">
        {apiKeyEntries.map((entry) => (
          <div key={entry.providerId} className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">
              {entry.label}
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="password"
                placeholder={entry.placeholder}
                value={apiKeys[entry.providerId] ?? ''}
                onChange={(e) => onApiKeyChange(entry.providerId, e.target.value)}
                className="flex-1"
              />
              {entry.verified ? (
                <span className="inline-flex items-center rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background">
                  Verified
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTestKey(entry.providerId)}
                >
                  Test Key
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  )
}
