import type {
  ResumeData,
  Section,
  WorkExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  SummarySection,
  CustomSection,
} from '@/types/resume'

interface ResumeDocumentProps {
  data: ResumeData
}

export function ResumeDocument({ data }: ResumeDocumentProps) {
  const { personalInfo, sections } = data
  const sortedSections = [...sections].sort((a, b) => a.order - b.order).filter((s) => s.visible)

  return (
    <div className="font-sans text-[11px] leading-[1.5] text-[#333]">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-[22px] font-bold leading-tight text-black">{personalInfo.fullName}</h1>
        <p className="mt-1 text-[12px] text-[#555]">{personalInfo.jobTitle}</p>
        <p className="mt-1 text-[10px] text-[#777]">
          {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' | ')}
        </p>
      </div>

      {/* Sections */}
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  )
}

function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case 'summary':
      return <SummaryRenderer section={section} />
    case 'work-experience':
      return <WorkExperienceRenderer section={section} />
    case 'education':
      return <EducationRenderer section={section} />
    case 'skills':
      return <SkillsRenderer section={section} />
    case 'projects':
      return <ProjectsRenderer section={section} />
    case 'certifications':
      return <CertificationsRenderer section={section} />
    case 'custom':
      return <CustomRenderer section={section} />
    default:
      return null
  }
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-2 mt-4">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-black">{title}</h2>
      <div className="mt-0.5 h-px bg-[#333]" />
    </div>
  )
}

function SummaryRenderer({ section }: { section: SummarySection }) {
  if (!section.content) return null
  return (
    <>
      <SectionTitle title={section.title} />
      <p>{section.content}</p>
    </>
  )
}

function WorkExperienceRenderer({ section }: { section: WorkExperienceSection }) {
  if (section.entries.length === 0) return null
  return (
    <>
      <SectionTitle title={section.title} />
      {section.entries.map((entry) => (
        <div key={entry.id} className="mb-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-bold text-black">{entry.title}</span>
            <span className="text-[10px] text-[#777]">
              {entry.startDate} — {entry.current ? 'Present' : entry.endDate}
            </span>
          </div>
          <p className="text-[11px] italic text-[#555]">{entry.company}</p>
          {entry.bullets.length > 0 && (
            <ul className="ml-4 mt-1 list-disc">
              {entry.bullets.filter(Boolean).map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  )
}

function EducationRenderer({ section }: { section: EducationSection }) {
  if (section.entries.length === 0) return null
  return (
    <>
      <SectionTitle title={section.title} />
      {section.entries.map((entry) => (
        <div key={entry.id} className="mb-2 flex items-baseline justify-between">
          <div>
            <span className="text-[12px] font-bold text-black">{entry.degree}</span>
            {entry.school && <span className="ml-2 text-[11px] text-[#555]">{entry.school}</span>}
          </div>
          <span className="text-[10px] text-[#777]">
            {entry.startDate} — {entry.endDate}
          </span>
        </div>
      ))}
    </>
  )
}

function SkillsRenderer({ section }: { section: SkillsSection }) {
  if (section.categories.length === 0) return null
  return (
    <>
      <SectionTitle title={section.title} />
      <div className="flex flex-col gap-0.5">
        {section.categories.map((cat) => (
          <p key={cat.id}>
            <span className="font-bold text-black">{cat.name}:</span>{' '}
            {cat.skills.join(', ')}
          </p>
        ))}
      </div>
    </>
  )
}

function ProjectsRenderer({ section }: { section: ProjectsSection }) {
  if (section.entries.length === 0) return null
  return (
    <>
      <SectionTitle title={section.title} />
      {section.entries.map((entry) => (
        <div key={entry.id} className="mb-2">
          <span className="text-[12px] font-bold text-black">{entry.name}</span>
          {entry.description && <p className="mt-0.5">{entry.description}</p>}
        </div>
      ))}
    </>
  )
}

function CertificationsRenderer({ section }: { section: CertificationsSection }) {
  if (section.entries.length === 0) return null
  return (
    <>
      <SectionTitle title={section.title} />
      {section.entries.map((entry) => (
        <div key={entry.id} className="mb-1 flex items-baseline justify-between">
          <div>
            <span className="text-[12px] font-bold text-black">{entry.name}</span>
            {entry.issuer && <span className="ml-2 text-[11px] text-[#555]">{entry.issuer}</span>}
          </div>
          {entry.date && <span className="text-[10px] text-[#777]">{entry.date}</span>}
        </div>
      ))}
    </>
  )
}

function CustomRenderer({ section }: { section: CustomSection }) {
  if (!section.content) return null
  return (
    <>
      <SectionTitle title={section.title} />
      <p>{section.content}</p>
    </>
  )
}
