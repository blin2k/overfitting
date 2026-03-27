import express from 'express'
import cors from 'cors'
import resumeRoutes from './routes/resume.js'
import apiKeysRoutes from './routes/api-keys.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api', resumeRoutes)
app.use('/api', apiKeysRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
