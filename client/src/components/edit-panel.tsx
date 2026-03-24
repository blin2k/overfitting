import { useResume } from '@/context/resume-context'
import { PersonalInfoEditor } from '@/components/editors/personal-info-editor'
import { SummaryEditor } from '@/components/editors/summary-editor'
import { WorkExperienceEditor } from '@/components/editors/work-experience-editor'
import { EducationEditor } from '@/components/editors/education-editor'
import { SkillsEditor } from '@/components/editors/skills-editor'
import { ProjectsEditor } from '@/components/editors/projects-editor'
import { CertificationsEditor } from '@/components/editors/certifications-editor'
import { CustomSectionEditor } from '@/components/editors/custom-section-editor'

interface EditPanelProps {
  activeSectionId: string
  onClose: () => void
}

export function EditPanel({ activeSectionId, onClose }: EditPanelProps) {
  const { state } = useResume()

  if (activeSectionId === 'personal-info') {
    return <PersonalInfoEditor onClose={onClose} />
  }

  const section = state.sections.find((s) => s.id === activeSectionId)
  if (!section) return null

  switch (section.type) {
    case 'summary':
      return <SummaryEditor key={section.id} section={section} onClose={onClose} />
    case 'work-experience':
      return <WorkExperienceEditor key={section.id} section={section} onClose={onClose} />
    case 'education':
      return <EducationEditor key={section.id} section={section} onClose={onClose} />
    case 'skills':
      return <SkillsEditor key={section.id} section={section} onClose={onClose} />
    case 'projects':
      return <ProjectsEditor key={section.id} section={section} onClose={onClose} />
    case 'certifications':
      return <CertificationsEditor key={section.id} section={section} onClose={onClose} />
    case 'custom':
      return <CustomSectionEditor key={section.id} section={section} onClose={onClose} />
    default:
      return null
  }
}
