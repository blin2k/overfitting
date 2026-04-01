import { Router } from 'express'
import { apiKeys, providerCatalog, maskKey, aiSettings, updateAISettings } from '../provider-store.js'

const router = Router()

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

router.get('/ai-settings', (_req, res) => {
  res.json(aiSettings)
})

router.post('/ai-settings', (req, res) => {
  const { provider, model } = req.body as { provider?: string; model?: string }
  updateAISettings({ provider, model })
  res.json(aiSettings)
})

export default router
