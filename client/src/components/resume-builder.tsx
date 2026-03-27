import { useState, useCallback } from 'react'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle, useDefaultLayout } from 'react-resizable-panels'
import { GripVertical } from 'lucide-react'
import { TopBar } from '@/components/top-bar'
import { SectionSidebar } from '@/components/section-sidebar'
import { EditPanel } from '@/components/edit-panel'
import { ResumePreview } from '@/components/preview/resume-preview'
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

  const threePanelProps = useDefaultLayout({ id: 'resume-three-panel' })
  const twoPanelProps = useDefaultLayout({ id: 'resume-two-panel' })

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
      {isEditing ? (
        <PanelGroup
          key="three-panel"
          {...threePanelProps}
          orientation="horizontal"
          className="flex-1"
        >
          <Panel id="sidebar" defaultSize="20%" minSize="15%" maxSize="35%">
            <SectionSidebar
              activeSection={activeSection}
              onSelectSection={setActiveSection}
            />
          </Panel>
          <ResizeHandle />
          <Panel id="editor" defaultSize="28%" minSize="20%" maxSize="45%">
            <EditPanel
              activeSectionId={activeSection}
              onClose={handleCloseEditor}
            />
          </Panel>
          <ResizeHandle />
          <Panel id="preview" defaultSize="52%" minSize="25%">
            <ResumePreview />
          </Panel>
        </PanelGroup>
      ) : (
        <PanelGroup
          key="two-panel"
          {...twoPanelProps}
          orientation="horizontal"
          className="flex-1"
        >
          <Panel id="sidebar" defaultSize="25%" minSize="15%" maxSize="40%">
            <SectionSidebar
              activeSection={activeSection}
              onSelectSection={setActiveSection}
            />
          </Panel>
          <ResizeHandle />
          <Panel id="preview" defaultSize="75%" minSize="30%">
            <ResumePreview />
          </Panel>
        </PanelGroup>
      )}
    </div>
  )
}
