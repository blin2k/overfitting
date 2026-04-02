import { useState } from 'react'
import { Plus } from 'lucide-react'
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

interface OpenSourceProject {
  name: string
  description: string
  keywords: string[]
  activity: string
}

const PLACEHOLDER_PROJECTS: OpenSourceProject[] = [
  {
    name: 'react-pdf',
    description:
      'Display PDFs in your React app as easily as images. Supports custom rendering, annotations, and more.',
    keywords: ['React', 'PDF', 'TypeScript'],
    activity: '~3 weeks',
  },
  {
    name: 'docusaurus',
    description:
      'Easy to maintain open-source documentation websites. Built with React and supports MDX, versioning, and i18n.',
    keywords: ['React', 'MDX', 'TypeScript'],
    activity: '~1 week',
  },
  {
    name: 'langchain',
    description:
      'A framework for building LLM-powered applications with composable components and tool integrations.',
    keywords: ['LLM', 'Python', 'AI Agents'],
    activity: '~2 weeks',
  },
  {
    name: 'fastapi',
    description:
      'Modern, fast web framework for building APIs with Python based on standard type hints.',
    keywords: ['REST API', 'Python', 'Backend'],
    activity: '~1 week',
  },
  {
    name: 'langchain',
    description:
      'A framework for building LLM-powered applications with composable components and tool integrations.',
    keywords: ['LLM', 'Python', 'AI Agents'],
    activity: '~2 weeks',
  },
  {
    name: 'fastapi',
    description:
      'Modern, fast web framework for building APIs with Python based on standard type hints.',
    keywords: ['REST API', 'Python', 'Backend'],
    activity: '~1 week',
  },
  {
    name: 'langchain',
    description:
      'A framework for building LLM-powered applications with composable components and tool integrations.',
    keywords: ['LLM', 'Python', 'AI Agents'],
    activity: '~2 weeks',
  },
  {
    name: 'fastapi',
    description:
      'Modern, fast web framework for building APIs with Python based on standard type hints.',
    keywords: ['REST API', 'Python', 'Backend'],
    activity: '~1 week',
  },
]

interface FillingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FillingDialog({ open, onOpenChange }: FillingDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleProject(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
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
          {PLACEHOLDER_PROJECTS.map((project) => (
            <div
              key={project.name}
              className="flex flex-col gap-2.5 border-b border-border py-4 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  {project.name}
                </span>
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
                  checked={selected.has(project.name)}
                  onCheckedChange={() => toggleProject(project.name)}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <span className="text-[13px] text-muted-foreground">
            {selected.size} of {PLACEHOLDER_PROJECTS.length} projects selected
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
