import { ResumeProvider } from '@/context/resume-context'
import { ResumeBuilder } from '@/components/resume-builder'

function App() {
  return (
    <ResumeProvider>
      <ResumeBuilder />
    </ResumeProvider>
  )
}

export default App
