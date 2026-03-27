import { useState, useCallback, useRef } from 'react'
import { TopBar } from '@/components/top-bar'
import { SettingsSidebar } from './settings-sidebar'
import { ConnectivityCard } from './connectivity-card'
import { ModelsCard } from './models-card'
import { ApiKeysCard } from './api-keys-card'

export function AISettingsPage() {
  const [activeNav, setActiveNav] = useState('connectivity')
  const [selectedProvider, setSelectedProvider] = useState('anthropic')
  const [providerModels, setProviderModels] = useState<Record<string, string>>({
    anthropic: 'Claude Opus 4',
    openai: 'GPT-4o',
  })
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})

  const contentRef = useRef<HTMLDivElement>(null)

  const handleNavChange = useCallback((id: string) => {
    setActiveNav(id)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleModelChange = useCallback((providerId: string, model: string) => {
    setProviderModels((prev) => ({ ...prev, [providerId]: model }))
  }, [])

  const handleApiKeyChange = useCallback((providerId: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: value }))
  }, [])

  const handleSaveSettings = useCallback(() => {
    // placeholder for future backend integration
  }, [])

  const handleTestKey = useCallback((_providerId: string) => {
    // placeholder for future backend integration
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <TopBar currentPage="settings" />
      <div className="flex flex-1 overflow-hidden">
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
              providerModels={providerModels}
              onModelChange={handleModelChange}
              onSave={handleSaveSettings}
            />
            <ApiKeysCard
              apiKeys={apiKeys}
              onApiKeyChange={handleApiKeyChange}
              onTestKey={handleTestKey}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
