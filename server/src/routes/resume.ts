import { Router } from 'express'
import type { ResumeData } from '@shared/types/resume'

const router = Router()

// In-memory storage for MVP
let storedResume: ResumeData | null = null

router.get('/resume', (_req, res) => {
  if (storedResume) {
    res.json(storedResume)
  } else {
    res.status(404).json({ error: 'No resume found' })
  }
})

router.post('/resume', (req, res) => {
  storedResume = req.body as ResumeData
  res.json({ success: true })
})

export default router
