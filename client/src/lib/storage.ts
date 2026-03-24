import type { ResumeData } from '@/types/resume'

const STORAGE_KEY = 'overfitting-resume'

export function saveResume(data: ResumeData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadResume(): ResumeData | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ResumeData
  } catch {
    return null
  }
}

export function clearResume(): void {
  localStorage.removeItem(STORAGE_KEY)
}
