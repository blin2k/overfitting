import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ResumeProvider } from '@/context/resume-context'
import { ResumeBuilder } from '@/components/resume-builder'
import { AISettingsPage } from '@/components/ai-settings/ai-settings-page'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/builder"
          element={
            <ResumeProvider>
              <ResumeBuilder />
            </ResumeProvider>
          }
        />
        <Route path="/settings" element={<AISettingsPage />} />
        <Route path="*" element={<Navigate to="/builder" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
