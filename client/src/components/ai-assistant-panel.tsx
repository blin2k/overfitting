import { useState, useCallback, useEffect } from 'react'
import {
  Sparkles,
  Star,
  Scissors,
  FilePlus,
  Highlighter,
  CircleCheck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useResume } from '@/context/resume-context'
import { analyzeResume, highlightResume, fetchAISettings, type AISettings } from '@/lib/api'
import type { AnalyzeResponse } from '@/types/analyze'
import { FillingDialog } from '@/components/filling-dialog'

const ACTION_CONFIG = [
  { type: 'rating' as const, icon: Star, label: 'Rating', color: 'text-[#EAB308]' },
  { type: 'pruning' as const, icon: Scissors, label: 'Pruning', color: 'text-[#EF4444]' },
  { type: 'filling' as const, icon: FilePlus, label: 'Filling', color: 'text-[#3B82F6]' },
  { type: 'highlighting' as const, icon: Highlighter, label: 'Highlighting', color: 'text-[#A855F7]' },
] as const

function ScoreRing({ score }: { score: number }) {
  const radius = 50
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <div className="relative flex items-center justify-center">
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle
          cx={60}
          cy={60}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={60}
          cy={60}
          r={radius}
          fill="none"
          stroke="#22C55E"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute flex items-end gap-0.5">
        <span className="text-4xl font-bold text-foreground">{score}</span>
        <span className="mb-1 text-sm font-medium text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

interface AIAssistantPanelProps {
  onHighlight: (keywords: string[]) => void
}

export function AIAssistantPanel({ onHighlight }: AIAssistantPanelProps) {
  const { state } = useResume()
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AnalyzeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null)
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [isFillingOpen, setIsFillingOpen] = useState(false)

  useEffect(() => {
    fetchAISettings().then(setAiSettings)
  }, [])

  const runAnalysis = useCallback(async () => {
    if (!aiSettings) return
    setIsLoading(true)
    setError(null)
    const response = await analyzeResume({
      resume: state,
      jobDescription,
      provider: aiSettings.provider,
      model: aiSettings.model,
    })
    if (response) {
      setResults(response)
    } else {
      setError('Analysis failed. Check your AI provider settings and API key.')
    }
    setIsLoading(false)
  }, [state, jobDescription, aiSettings])

  const runHighlight = useCallback(async () => {
    if (!aiSettings) return
    setIsHighlighting(true)
    const response = await highlightResume({
      resume: state,
      jobDescription,
      provider: aiSettings.provider,
      model: aiSettings.model,
    })
    if (response) {
      onHighlight(response.keywords)
    }
    setIsHighlighting(false)
  }, [state, jobDescription, aiSettings, onHighlight])

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="text-sm font-semibold text-foreground">
          {results ? 'AI Analysis' : 'AI Assistant'}
        </span>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </div>

      {results ? (
        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          <div className="flex flex-col items-center gap-3 pt-2">
            <ScoreRing score={results.score} />
            <div className="flex items-center gap-1 rounded-full bg-[#DCFCE7] px-3 py-1">
              <CircleCheck className="h-3.5 w-3.5 text-[#16A34A]" />
              <span className="text-xs font-semibold text-[#16A34A]">
                {results.matchLevel}
              </span>
            </div>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {results.description}
            </p>
          </div>

          <Separator />

          <span className="text-[13px] font-semibold text-foreground">AI Actions</span>
          <div className="grid grid-cols-2 gap-2">
            {ACTION_CONFIG.map((action) => {
              const isBusy =
                (action.type === 'rating' && isLoading) ||
                (action.type === 'highlighting' && isHighlighting)
              const handler =
                action.type === 'rating' ? runAnalysis
                : action.type === 'highlighting' ? runHighlight
                : action.type === 'filling' ? () => setIsFillingOpen(true)
                : undefined
              const busyLabel =
                action.type === 'rating' ? 'Re-rating...'
                : action.type === 'highlighting' ? 'Highlighting...'
                : action.label
              return (
                <button
                  key={action.type}
                  disabled={isBusy}
                  onClick={handler}
                  className="flex h-20 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card disabled:opacity-50"
                >
                  {isBusy ? (
                    <Loader2 className={`h-5 w-5 animate-spin ${action.color}`} />
                  ) : (
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  )}
                  <span className="text-xs font-medium text-foreground">
                    {isBusy ? busyLabel : action.label}
                  </span>
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => { setResults(null); setError(null); onHighlight([]) }}
          >
            New Analysis
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-foreground">Job Description</Label>
            <Textarea
              placeholder="Paste the job description here to tailor your resume..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
          <Button onClick={runAnalysis} disabled={!jobDescription.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Optimize with AI'}
          </Button>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            AI will analyze the job description and suggest improvements to your resume sections.
          </p>
        </div>
      )}
      <FillingDialog
        open={isFillingOpen}
        onOpenChange={setIsFillingOpen}
        jobDescription={jobDescription}
        provider={aiSettings?.provider ?? ''}
        model={aiSettings?.model ?? ''}
      />
    </div>
  )
}
