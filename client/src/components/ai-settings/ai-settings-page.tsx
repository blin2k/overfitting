import { useState, useCallback, useEffect, useRef } from 'react'
import { TopBar } from '@/components/top-bar'
import { SettingsSidebar } from './settings-sidebar'
import { ConnectivityCard } from './connectivity-card'
import { ModelsCard } from './models-card'
import { ApiKeysCard } from './api-keys-card'
import { AddApiKeyDialog } from './add-api-key-dialog'
import {
  fetchApiKeys,
  saveApiKey,
  deleteApiKey,
  fetchConfiguredProviders,
  type ApiKeyRecord,
  type ProviderConfig,
} from '@/lib/api'

export function AISettingsPage() {
  const [activeNav, setActiveNav] = useState('connectivity')
  const [selectedProvider, setSelectedProvider] = useState('anthropic')
  const [providerModels, setProviderModels] = useState<Record<string, string>>({
    anthropic: 'Claude Opus 4',
    openai: 'GPT-4o',
  })
  const [apiKeyEntries, setApiKeyEntries] = useState<ApiKeyRecord[]>([])
  const [configuredProviders, setConfiguredProviders] = useState<ProviderConfig[]>([])
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  const refreshProviderData = useCallback(async () => {
    const [keys, providers] = await Promise.all([
      fetchApiKeys(),
      fetchConfiguredProviders(),
    ])
    setApiKeyEntries(keys)
    setConfiguredProviders(providers)
  }, [])

  useEffect(() => {
    refreshProviderData()
  }, [refreshProviderData])

  const handleNavChange = useCallback((id: string) => {
    setActiveNav(id)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleModelChange = useCallback((providerId: string, model: string) => {
    setProviderModels((prev) => ({ ...prev, [providerId]: model }))
  }, [])

  const handleSaveSettings = useCallback(() => {
    // placeholder for future backend integration
  }, [])

  const handleAddKeySave = useCallback(async (providerId: string, apiKey: string) => {
    const result = await saveApiKey(providerId, apiKey)
    if (result?.success) {
      await refreshProviderData()
    }
    setShowAddKeyDialog(false)
  }, [refreshProviderData])

  const handleDeleteKey = useCallback(async (provider: string) => {
    const ok = await deleteApiKey(provider)
    if (ok) {
      await refreshProviderData()
    }
  }, [refreshProviderData])

  return (
    <div className="flex h-screen flex-col">
      <TopBar currentPage="settings" />
      <div className={`flex flex-1 overflow-hidden transition-[filter] duration-200 ${showAddKeyDialog ? 'blur-sm' : ''}`}>
        <SettingsSidebar activeNav={activeNav} onNavChange={handleNavChange} />
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-8 px-10 py-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">AI Providers</h1>
              <p className="text-sm text-muted-foreground">
                Configure your AI service providers, manage API keys, and set defaults.
              </p>
            </div>
            <ConnectivityCard
              selectedProvider={selectedProvider}
              onSelectProvider={setSelectedProvider}
            />
            <ModelsCard
              configuredProviders={configuredProviders}
              providerModels={providerModels}
              onModelChange={handleModelChange}
              onSave={handleSaveSettings}
            />
            <ApiKeysCard
              entries={apiKeyEntries}
              onAddKey={() => setShowAddKeyDialog(true)}
              onDeleteKey={handleDeleteKey}
            />
          </div>
        </div>
      </div>
      <AddApiKeyDialog
        open={showAddKeyDialog}
        onClose={() => setShowAddKeyDialog(false)}
        onSave={handleAddKeySave}
      />
    </div>
  )
}
