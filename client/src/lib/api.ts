import type { ResumeData } from '@/types/resume'

const API_BASE = '/api'

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
