import { Router } from 'express'
import type { AnalyzeRequest, AnalyzeResponse, MatchLevel, HighlightRequest, FillingRequest, OpenSourceProject } from '@shared/types/analyze'
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

function buildHighlightPrompt(resumeJson: string, jobDescription: string): string {
  return `You are a resume analyst. Identify keywords and short phrases from the job description that also appear in the resume.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "keywords": ["keyword1", "keyword2", ...]
}

Rules:
- Only include words/phrases that appear in BOTH the resume and the job description
- Include technical skills, tools, methodologies, and domain terms
- Include short phrases (2-3 words) when they appear as a unit (e.g. "machine learning", "project management")
- Do NOT include generic words like "the", "and", "experience", "team", "work", "role"
- Return between 5 and 30 keywords, prioritizing the most relevant ones
- Each keyword must be the exact text as it appears in the resume (preserve original casing)

RESUME:
${resumeJson}

JOB DESCRIPTION:
${jobDescription}`
}

router.post('/highlight', async (req, res) => {
  const { resume, jobDescription, provider, model } = req.body as HighlightRequest

  if (!resume || !jobDescription || !provider || !model) {
    res.status(400).json({ error: 'resume, jobDescription, provider, and model are required' })
    return
  }

  const stored = apiKeys.get(provider)
  if (!stored) {
    res.status(400).json({ error: `No API key configured for provider: ${provider}` })
    return
  }

  const modelId = modelIdMap[model] ?? model
  const prompt = buildHighlightPrompt(JSON.stringify(resume, null, 2), jobDescription)

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

    const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const keywords: string[] = Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((k: unknown) => typeof k === 'string' && k.length > 0)
      : []

    res.json({ keywords })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: `Highlight extraction failed: ${message}` })
  }
})

function buildFillingPrompt(jobDescription: string): string {
  return `You are a career advisor. Based on the following job description, recommend 4-6 real, well-known open-source projects on GitHub that a candidate could contribute to in order to strengthen their resume for this role.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "projects": [
    {
      "name": "project-name",
      "url": "https://github.com/owner/repo",
      "description": "One sentence describing the project and why it's relevant.",
      "keywords": ["Tag1", "Tag2", "Tag3"],
      "activity": "~N weeks"
    }
  ]
}

Rules:
- Only recommend REAL open-source projects that actually exist on GitHub
- The "url" must be a real GitHub repository URL (https://github.com/owner/repo)
- The "keywords" should be 2-4 short tech/domain tags relevant to both the project and the job
- The "activity" should be your best estimate of recent commit frequency (e.g. "~1 week", "~2 weeks", "~1 month")
- Choose projects where contributing would demonstrate skills relevant to the job description
- Prefer projects that are actively maintained and welcoming to contributors

JOB DESCRIPTION:
${jobDescription}`
}

router.post('/filling', async (req, res) => {
  const { jobDescription, provider, model } = req.body as FillingRequest

  if (!jobDescription || !provider || !model) {
    res.status(400).json({ error: 'jobDescription, provider, and model are required' })
    return
  }

  const stored = apiKeys.get(provider)
  if (!stored) {
    res.status(400).json({ error: `No API key configured for provider: ${provider}` })
    return
  }

  const modelId = modelIdMap[model] ?? model
  const prompt = buildFillingPrompt(jobDescription)

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

    const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const projects: OpenSourceProject[] = Array.isArray(parsed.projects)
      ? parsed.projects
          .filter((p: any) => p.name && p.url && p.description)
          .map((p: any) => ({
            name: p.name,
            url: p.url,
            description: p.description,
            keywords: Array.isArray(p.keywords) ? p.keywords : [],
            activity: p.activity || 'unknown',
          }))
      : []

    res.json({ projects })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: `Filling projects failed: ${message}` })
  }
})

export default router
