import type { ResumeData } from '@/types/resume'
import type { AnalyzeRequest, AnalyzeResponse } from '@/types/analyze'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchResume(): Promise<ResumeData | null> {
  try {
    const res = await fetch(`${API_BASE}/resume`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function saveResumeToServer(data: ResumeData): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.ok
  } catch {
    return false
  }
}

export interface ProviderConfig {
  id: string
  name: string
  models: string[]
  defaultModel: string
}

export async function fetchConfiguredProviders(): Promise<ProviderConfig[]> {
  try {
    const res = await fetch(`${API_BASE}/providers`)
    if (!res.ok) return []
    const data = await res.json()
    return data.providers ?? []
  } catch {
    return []
  }
}

export interface ApiKeyRecord {
  provider: string
  maskedKey: string
  tested: boolean
}

export async function fetchApiKeys(): Promise<ApiKeyRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/api-keys`)
    if (!res.ok) return []
    const data = await res.json()
    return data.keys ?? []
  } catch {
    return []
  }
}

export async function saveApiKey(
  provider: string,
  apiKey: string,
  tested?: boolean
): Promise<{ success: boolean; maskedKey: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey, tested }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function testApiKey(
  provider: string,
  apiKey?: string
): Promise<boolean> {
  try {
    const body: Record<string, string> = { provider }
    if (apiKey) body.apiKey = apiKey
    const res = await fetch(`${API_BASE}/api-keys/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

export async function analyzeResume(
  request: AnalyzeRequest
): Promise<AnalyzeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export interface AISettings {
  provider: string
  model: string
}

export async function fetchAISettings(): Promise<AISettings> {
  try {
    const res = await fetch(`${API_BASE}/ai-settings`)
    if (!res.ok) return { provider: 'anthropic', model: 'Claude Opus 4' }
    return await res.json()
  } catch {
    return { provider: 'anthropic', model: 'Claude Opus 4' }
  }
}

export async function saveAISettings(settings: Partial<AISettings>): Promise<AISettings> {
  try {
    const res = await fetch(`${API_BASE}/ai-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (!res.ok) return { provider: 'anthropic', model: 'Claude Opus 4' }
    return await res.json()
  } catch {
    return { provider: 'anthropic', model: 'Claude Opus 4' }
  }
}

export async function deleteApiKey(provider: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api-keys/${encodeURIComponent(provider)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}
