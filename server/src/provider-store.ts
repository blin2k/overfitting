export interface StoredKey {
  provider: string
  maskedKey: string
  key: string
  tested: boolean
}

export const apiKeys = new Map<string, StoredKey>()

export const providerCatalog: Record<string, { name: string; models: string[]; defaultModel: string }> = {
  anthropic: { name: 'Anthropic', models: ['Claude Opus 4', 'Claude Sonnet 4', 'Claude Haiku 3.5'], defaultModel: 'Claude Opus 4' },
  openai: { name: 'OpenAI', models: ['GPT-4o', 'GPT-4-turbo', 'GPT-3.5-turbo'], defaultModel: 'GPT-4o' },
  gemini: { name: 'Gemini', models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini 2.0 Flash'], defaultModel: 'Gemini 2.5 Pro' },
  kimi: { name: 'Kimi', models: ['Moonshot-v1-8k', 'Moonshot-v1-32k', 'Moonshot-v1-128k'], defaultModel: 'Moonshot-v1-8k' },
}

export const modelIdMap: Record<string, string> = {
  'Claude Opus 4': 'claude-opus-4-20250514',
  'Claude Sonnet 4': 'claude-sonnet-4-20250514',
  'Claude Haiku 3.5': 'claude-haiku-4-5-20241022',
  'GPT-4o': 'gpt-4o',
  'GPT-4-turbo': 'gpt-4-turbo',
  'GPT-3.5-turbo': 'gpt-3.5-turbo',
  'Gemini 2.5 Pro': 'gemini-2.5-pro',
  'Gemini 2.5 Flash': 'gemini-2.5-flash',
  'Gemini 2.0 Flash': 'gemini-2.0-flash',
  'Moonshot-v1-8k': 'moonshot-v1-8k',
  'Moonshot-v1-32k': 'moonshot-v1-32k',
  'Moonshot-v1-128k': 'moonshot-v1-128k',
}

export interface AISettings {
  provider: string
  model: string
}

export let aiSettings: AISettings = {
  provider: 'anthropic',
  model: 'Claude Opus 4',
}

export function updateAISettings(settings: Partial<AISettings>) {
  const provider = settings.provider ?? aiSettings.provider
  const model = settings.model
    ?? (settings.provider ? providerCatalog[settings.provider]?.defaultModel : undefined)
    ?? aiSettings.model
  aiSettings = { provider, model }
}

export function maskKey(key: string): string {
  if (key.length <= 8) return '•'.repeat(key.length)
  return key.slice(0, 6) + '•'.repeat(Math.min(key.length - 10, 16)) + key.slice(-4)
}
