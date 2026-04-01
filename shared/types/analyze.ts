import type { ResumeData } from './resume.js'

export interface AnalyzeRequest {
  resume: ResumeData
  jobDescription: string
  provider: string
  model: string
}

export type MatchLevel = 'Excellent Match' | 'Good Match' | 'Fair Match' | 'Needs Work'

export interface AnalyzeAction {
  id: string
  label: string
  type: 'rating' | 'pruning' | 'filling' | 'highlighting'
}

export interface AnalyzeResponse {
  score: number
  matchLevel: MatchLevel
  description: string
  actions: AnalyzeAction[]
}

export interface HighlightRequest {
  resume: ResumeData
  jobDescription: string
  provider: string
  model: string
}

export interface HighlightResponse {
  keywords: string[]
}
