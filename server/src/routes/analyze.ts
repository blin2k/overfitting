import { Router } from 'express'
import type { AnalyzeRequest, AnalyzeResponse, MatchLevel } from '@shared/types/analyze'
import { apiKeys, modelIdMap } from '../provider-store.js'

const router = Router()

function buildPrompt(resumeJson: string, jobDescription: string): string {
  return `You are a resume analyst. Evaluate how well the following resume matches the given job description.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "score": <number 0-100>,
  "matchLevel": "<one of: Excellent Match, Good Match, Fair Match, Needs Work>",
  "description": "<2-3 sentence analysis explaining the match>"
}

Score guidelines:
- 85-100: Excellent Match — resume strongly aligns with the role
- 65-84: Good Match — resume is well-aligned with minor gaps
- 45-64: Fair Match — resume partially matches, notable gaps exist
- 0-44: Needs Work — significant misalignment between resume and role

RESUME:
${resumeJson}

JOB DESCRIPTION:
${jobDescription}`
}

async function callAnthropic(apiKey: string, modelId: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

async function callOpenAI(apiKey: string, modelId: string, prompt: string, baseUrl = 'https://api.openai.com'): Promise<string> {
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content
}

async function callGemini(apiKey: string, modelId: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

function parseAIResponse(text: string): AnalyzeResponse {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const parsed = JSON.parse(cleaned)

  const score = Math.max(0, Math.min(100, Math.round(parsed.score)))

  const validLevels: MatchLevel[] = ['Excellent Match', 'Good Match', 'Fair Match', 'Needs Work']
  const matchLevel: MatchLevel = validLevels.includes(parsed.matchLevel)
    ? parsed.matchLevel
    : score >= 85 ? 'Excellent Match' : score >= 65 ? 'Good Match' : score >= 45 ? 'Fair Match' : 'Needs Work'

  return {
    score,
    matchLevel,
    description: parsed.description || 'Analysis complete.',
    actions: [
      { id: 'rating', label: 'Rating', type: 'rating' },
      { id: 'pruning', label: 'Pruning', type: 'pruning' },
      { id: 'filling', label: 'Filling', type: 'filling' },
      { id: 'highlighting', label: 'Highlighting', type: 'highlighting' },
    ],
  }
}

router.post('/analyze', async (req, res) => {
  const { resume, jobDescription, provider, model } = req.body as AnalyzeRequest

  if (!resume || !jobDescription) {
    res.status(400).json({ error: 'resume and jobDescription are required' })
    return
  }

  if (!provider || !model) {
    console.log(provider, model);
    res.status(400).json({ error: 'provider and model are required' })
    return
  }

  const stored = apiKeys.get(provider)
  if (!stored) {
    res.status(400).json({ error: `No API key configured for provider: ${provider}` })
    return
  }

  const modelId = modelIdMap[model] ?? model
  const prompt = buildPrompt(JSON.stringify(resume, null, 2), jobDescription)

  try {
    let responseText: string

    if (provider === 'anthropic') {
      responseText = await callAnthropic(stored.key, modelId, prompt)
    } else if (provider === 'openai') {
      responseText = await callOpenAI(stored.key, modelId, prompt)
    } else if (provider === 'gemini') {
      responseText = await callGemini(stored.key, modelId, prompt)
    } else if (provider === 'kimi') {
      responseText = await callOpenAI(stored.key, modelId, prompt, 'https://api.moonshot.cn')
    } else {
      res.status(400).json({ error: `Unsupported provider: ${provider}` })
      return
    }

    const result = parseAIResponse(responseText)
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: `AI analysis failed: ${message}` })
  }
})

export default router
