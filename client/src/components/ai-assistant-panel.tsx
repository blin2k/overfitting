import { useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function AIAssistantPanel() {
  const [jobDescription, setJobDescription] = useState('')

  const handleOptimize = useCallback(() => {
    // placeholder for future AI integration
  }, [])

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">AI Assistant</span>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-semibold text-foreground">Job Description</Label>
          <Textarea
            placeholder="Paste the job description here to tailor your resume..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </div>
        <Button onClick={handleOptimize} disabled={!jobDescription.trim()}>
          <Sparkles className="mr-2 h-4 w-4" />
          Optimize with AI
        </Button>
        <p className="text-xs text-muted-foreground">
          AI will analyze the job description and suggest improvements to your resume sections.
        </p>
      </div>
    </div>
  )
}
