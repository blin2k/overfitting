import express from 'express'
import cors from 'cors'
import resumeRoutes from './routes/resume.js'
import apiKeysRoutes from './routes/api-keys.js'
import analyzeRoutes from './routes/analyze.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}))
app.use(express.json())

app.use('/api', resumeRoutes)
app.use('/api', apiKeysRoutes)
app.use('/api', analyzeRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
