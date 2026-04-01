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
  testApiKey,
  fetchAISettings,
  saveAISettings,
  type ApiKeyRecord,
  type ProviderConfig,
} from '@/lib/api'

export type TestStatus = 'idle' | 'testing' | 'success' | 'error'

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
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({})

  const contentRef = useRef<HTMLDivElement>(null)

  const refreshProviderData = useCallback(async () => {
    const [keys, providers, settings] = await Promise.all([
      fetchApiKeys(),
      fetchConfiguredProviders(),
      fetchAISettings(),
    ])
    setApiKeyEntries(keys)
    setConfiguredProviders(providers)
    setSelectedProvider(settings.provider)
    setProviderModels((prev) => ({ ...prev, [settings.provider]: settings.model }))
    setTestStatuses((prev) => {
      const next = { ...prev }
      for (const key of keys) {
        if (key.tested && !next[key.provider]) {
          next[key.provider] = 'success'
        }
      }
      return next
    })
  }, [])

  useEffect(() => {
    refreshProviderData()
  }, [refreshProviderData])

  const handleNavChange = useCallback((id: string) => {
    setActiveNav(id)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleSelectProvider = useCallback((id: string) => {
    setSelectedProvider(id)
    const model = providerModels[id]
      ?? configuredProviders.find((p) => p.id === id)?.defaultModel
    saveAISettings({ provider: id, model })
  }, [providerModels, configuredProviders])

  const handleModelChange = useCallback((providerId: string, model: string) => {
    setProviderModels((prev) => ({ ...prev, [providerId]: model }))
    if (providerId === selectedProvider) {
      saveAISettings({ model })
    }
  }, [selectedProvider])

  const handleTestKey = useCallback(async (provider: string) => {
    setTestStatuses((prev) => ({ ...prev, [provider]: 'testing' }))
    const ok = await testApiKey(provider)
    setTestStatuses((prev) => ({ ...prev, [provider]: ok ? 'success' : 'error' }))
  }, [])

  const handleAddKeySave = useCallback(async (providerId: string, apiKey: string, testPassed: boolean) => {
    const result = await saveApiKey(providerId, apiKey)
    if (result?.success) {
      await refreshProviderData()
      if (testPassed) {
        setTestStatuses((prev) => ({ ...prev, [providerId]: 'success' }))
      }
    }
    setShowAddKeyDialog(false)
  }, [refreshProviderData])

  const handleDeleteKey = useCallback(async (provider: string) => {
    const ok = await deleteApiKey(provider)
    if (ok) {
      setTestStatuses((prev) => {
        const next = { ...prev }
        delete next[provider]
        return next
      })
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
              onSelectProvider={handleSelectProvider}
              savedProviders={apiKeyEntries.map((e) => e.provider)}
              testStatuses={testStatuses}
            />
            <ModelsCard
              configuredProviders={configuredProviders}
              providerModels={providerModels}
              onModelChange={handleModelChange}
            />
            <ApiKeysCard
              entries={apiKeyEntries}
              onAddKey={() => setShowAddKeyDialog(true)}
              onDeleteKey={handleDeleteKey}
              testStatuses={testStatuses}
              onTestKey={handleTestKey}
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
