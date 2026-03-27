import { useState } from 'react'
import { Plus, Trash2, Wifi, WifiOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SettingsCard } from './settings-card'
import { testApiKey, type ApiKeyRecord } from '@/lib/api'

type TestStatus = 'idle' | 'testing' | 'success' | 'error'

interface ApiKeysCardProps {
  entries: ApiKeyRecord[]
  onAddKey: () => void
  onDeleteKey: (provider: string) => void
}

export function ApiKeysCard({ entries, onAddKey, onDeleteKey }: ApiKeysCardProps) {
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({})

  const handleTest = async (provider: string) => {
    setTestStatuses((prev) => ({ ...prev, [provider]: 'testing' }))
    const ok = await testApiKey(provider)
    setTestStatuses((prev) => ({ ...prev, [provider]: ok ? 'success' : 'error' }))
  }

  return (
    <SettingsCard
      id="api-keys"
      title="API Keys"
      subtitle="Enter your API keys for each provider. Keys are encrypted and stored securely."
      action={
        <Button size="sm" variant="outline" onClick={onAddKey}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      }
    >
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No API keys configured. Click "Add" to connect a provider.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {entries.map((entry) => {
            const status = testStatuses[entry.provider] ?? 'idle'
            return (
              <div key={entry.provider} className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">
                  {entry.provider.charAt(0).toUpperCase() + entry.provider.slice(1)} API Key
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground font-mono">
                    {entry.maskedKey}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(entry.provider)}
                    disabled={status === 'testing'}
                  >
                    {status === 'testing' ? 'Testing...' : 'Test'}
                  </Button>
                  {status === 'success' && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Wifi className="h-4 w-4" />
                    </span>
                  )}
                  {status === 'error' && (
                    <span className="flex items-center gap-1 text-sm text-destructive">
                      <WifiOff className="h-4 w-4" />
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteKey(entry.provider)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SettingsCard>
  )
}
