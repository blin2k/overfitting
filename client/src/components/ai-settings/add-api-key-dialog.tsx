import { useState, useCallback } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { testApiKey } from '@/lib/api'

const providers = [
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'kimi', name: 'Kimi' },
]

interface AddApiKeyDialogProps {
  open: boolean
  onClose: () => void
  onSave: (providerId: string, apiKey: string) => Promise<void>
}

export function AddApiKeyDialog({ open, onClose, onSave }: AddApiKeyDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState(providers[0].id)
  const [apiKey, setApiKey] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [saving, setSaving] = useState(false)

  const handleTestConnection = useCallback(async () => {
    setTestStatus('testing')
    const ok = await testApiKey(selectedProvider, apiKey)
    setTestStatus(ok ? 'success' : 'error')
  }, [selectedProvider, apiKey])

  const handleSave = useCallback(async () => {
    if (apiKey.trim() && !saving) {
      setSaving(true)
      await onSave(selectedProvider, apiKey.trim())
      setSelectedProvider(providers[0].id)
      setApiKey('')
      setTestStatus('idle')
      setSaving(false)
    }
  }, [selectedProvider, apiKey, onSave, saving])

  const handleClose = useCallback(() => {
    setSelectedProvider(providers[0].id)
    setApiKey('')
    setTestStatus('idle')
    onClose()
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32"
      onClick={handleClose}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">Add API Key</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Connect a new AI provider by entering its API key.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Provider</Label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">API Key</Label>
            <Input
              type="password"
              placeholder="Enter your API key..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setTestStatus('idle')
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestConnection}
              disabled={!apiKey.trim() || testStatus === 'testing'}
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
            {testStatus === 'success' && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Wifi className="h-4 w-4" />
                Connected
              </span>
            )}
            {testStatus === 'error' && (
              <span className="flex items-center gap-1 text-sm text-destructive">
                <WifiOff className="h-4 w-4" />
                Connection failed
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!apiKey.trim() || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
