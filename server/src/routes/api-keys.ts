import { Router } from 'express'

const router = Router()

interface StoredKey {
  provider: string
  maskedKey: string
  key: string
}

// In-memory storage for MVP
const apiKeys = new Map<string, StoredKey>()

const providerCatalog: Record<string, { name: string; models: string[]; defaultModel: string }> = {
  anthropic: { name: 'Anthropic', models: ['Claude Opus 4', 'Claude Sonnet 4', 'Claude Haiku 3.5'], defaultModel: 'Claude Opus 4' },
  openai: { name: 'OpenAI', models: ['GPT-4o', 'GPT-4-turbo', 'GPT-3.5-turbo'], defaultModel: 'GPT-4o' },
  gemini: { name: 'Gemini', models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini 2.0 Flash'], defaultModel: 'Gemini 2.5 Pro' },
  kimi: { name: 'Kimi', models: ['Moonshot-v1-8k', 'Moonshot-v1-32k', 'Moonshot-v1-128k'], defaultModel: 'Moonshot-v1-8k' },
}

function maskKey(key: string): string {
  if (key.length <= 8) return '•'.repeat(key.length)
  return key.slice(0, 6) + '•'.repeat(Math.min(key.length - 10, 16)) + key.slice(-4)
}

router.get('/providers', (_req, res) => {
  const providers = Array.from(apiKeys.keys())
    .filter((id) => id in providerCatalog)
    .map((id) => ({
      id,
      ...providerCatalog[id],
    }))
  res.json({ providers })
})

router.get('/api-keys', (_req, res) => {
  const keys = Array.from(apiKeys.values()).map(({ provider, maskedKey }) => ({
    provider,
    maskedKey,
  }))
  res.json({ keys })
})

router.post('/api-keys', (req, res) => {
  const { provider, apiKey } = req.body as { provider: string; apiKey: string }

  if (!provider || !apiKey) {
    res.status(400).json({ error: 'provider and apiKey are required' })
    return
  }

  const maskedKey = maskKey(apiKey)
  apiKeys.set(provider, { provider, maskedKey, key: apiKey })
  res.json({ success: true, maskedKey })
})

router.post('/api-keys/test', async (req, res) => {
  const { provider, apiKey } = req.body as { provider?: string; apiKey?: string }

  if (!provider) {
    res.status(400).json({ error: 'provider is required' })
    return
  }

  // If apiKey is provided, test that key directly. Otherwise test the stored key.
  const keyToTest = apiKey ?? apiKeys.get(provider)?.key

  if (!keyToTest) {
    res.json({ success: false, error: 'No API key to test' })
    return
  }

  try {
    let ok = false

    if (provider === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': keyToTest,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      ok = r.ok
    } else if (provider === 'openai') {
      const r = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${keyToTest}` },
      })
      ok = r.ok
    } else if (provider === 'gemini') {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`
      )
      ok = r.ok
    } else if (provider === 'kimi') {
      const r = await fetch('https://api.moonshot.cn/v1/models', {
        headers: { Authorization: `Bearer ${keyToTest}` },
      })
      ok = r.ok
    }

    res.json({ success: ok })
  } catch {
    res.json({ success: false, error: 'Connection failed' })
  }
})

router.delete('/api-keys/:provider', (req, res) => {
  const { provider } = req.params
  apiKeys.delete(provider)
  res.json({ success: true })
})

export default router
