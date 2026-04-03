import { useState, useEffect } from 'react'
import { Plus, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { fillingProjects } from '@/lib/api'
import type { OpenSourceProject } from '@/types/analyze'

interface FillingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobDescription: string
  provider: string
  model: string
}

export function FillingDialog({
  open,
  onOpenChange,
  jobDescription,
  provider,
  model,
}: FillingDialogProps) {
  const [projects, setProjects] = useState<OpenSourceProject[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !jobDescription || !provider || !model) return
    setIsLoading(true)
    setError(null)
    setSelected(new Set())
    fillingProjects({ jobDescription, provider, model }).then((res) => {
      if (res) {
        setProjects(res.projects)
      } else {
        setError('Failed to fetch projects. Check your AI provider settings.')
      }
      setIsLoading(false)
    })
  }, [open, jobDescription, provider, model])

  function toggleProject(index: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[680px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Recommended Open-Source Projects</DialogTitle>
            <DialogClose />
          </div>
          <DialogDescription>
            Projects that match your target job description. Contributing to
            these can strengthen your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Finding matching projects...
              </p>
            </div>
          )}
          {error && (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          )}
          {!isLoading &&
            !error &&
            projects.map((project, index) => (
              <div
                key={index}
                className="flex flex-col gap-2.5 border-b border-border py-4 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:underline"
                  >
                    {project.name}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
                    {project.activity}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {project.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                  <Checkbox
                    checked={selected.has(index)}
                    onCheckedChange={() => toggleProject(index)}
                  />
                </div>
              </div>
            ))}
        </div>

        <DialogFooter>
          <span className="text-[13px] text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `${selected.size} of ${projects.length} projects selected`}
          </span>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={selected.size === 0}>
            <Plus className="size-4" />
            Add to Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
