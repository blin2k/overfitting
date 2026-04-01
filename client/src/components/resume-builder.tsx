import { useState, useCallback } from 'react'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { GripVertical } from 'lucide-react'
import { TopBar } from '@/components/top-bar'
import { SectionSidebar } from '@/components/section-sidebar'
import { EditPanel } from '@/components/edit-panel'
import { ResumePreview } from '@/components/preview/resume-preview'
import { AIAssistantPanel } from '@/components/ai-assistant-panel'
import { useResume } from '@/context/resume-context'
import { saveResumeToServer } from '@/lib/api'
import { exportPdf } from '@/lib/pdf-export'

function ResizeHandle() {
  return (
    <PanelResizeHandle className="flex w-2 items-center justify-center border-x border-border bg-background hover:bg-muted transition-colors">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
    </PanelResizeHandle>
  )
}

export function ResumeBuilder() {
  const { state } = useResume()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [highlightKeywords, setHighlightKeywords] = useState<string[]>([])

  const handleSave = useCallback(() => {
    saveResumeToServer(state)
  }, [state])

  const handleExport = useCallback(() => {
    exportPdf(state)
  }, [state])

  const handleCloseEditor = useCallback(() => {
    setActiveSection(null)
  }, [])

  const isEditing = activeSection !== null

  return (
    <div className="flex h-screen flex-col">
      <TopBar currentPage="builder" onSave={handleSave} onExport={handleExport} />
      <PanelGroup
        orientation="horizontal"
        className="flex-1"
      >
        <Panel id="sidebar" defaultSize="15%" minSize="12%" maxSize="25%">
          <SectionSidebar
            activeSection={activeSection}
            onSelectSection={setActiveSection}
          />
        </Panel>
        <ResizeHandle />
        {isEditing && (
          <>
            <Panel id="editor" defaultSize="23%" minSize="18%" maxSize="35%">
              <EditPanel
                activeSectionId={activeSection}
                onClose={handleCloseEditor}
              />
            </Panel>
            <ResizeHandle />
          </>
        )}
        <Panel id="preview" defaultSize={isEditing ? "42%" : "60%"} minSize="20%">
          <ResumePreview highlightKeywords={highlightKeywords} />
        </Panel>
        <ResizeHandle />
        <Panel id="ai-panel" defaultSize="20%" minSize="15%" maxSize="30%">
          <AIAssistantPanel onHighlight={setHighlightKeywords} />
        </Panel>
      </PanelGroup>
    </div>
  )
}
