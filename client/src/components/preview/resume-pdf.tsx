import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
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

const s = StyleSheet.create({
  page: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333',
    padding: 48,
  },
  header: { marginBottom: 16, alignItems: 'center' },
  name: { fontSize: 22, fontWeight: 700, color: '#000' },
  jobTitle: { fontSize: 12, color: '#555', marginTop: 4 },
  contact: { fontSize: 10, color: '#777', marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#333', marginBottom: 8 },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryTitle: { fontSize: 12, fontWeight: 700, color: '#000' },
  entryDate: { fontSize: 10, color: '#777' },
  entrySubtitle: { fontSize: 11, fontStyle: 'italic', color: '#555' },
  bullet: { marginLeft: 16, marginTop: 2 },
  entryBlock: { marginBottom: 10 },
  skillRow: { marginBottom: 2 },
  bold: { fontWeight: 700, color: '#000' },
})

function highlightText(text: string, keywords: string[]): React.ReactNode {
  if (!keywords.length) return text
  const pattern = keywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    regex.test(part)
      ? <Text key={i} style={s.bold}>{part}</Text>
      : part
  )
}

interface ResumePdfProps {
  data: ResumeData
  highlightKeywords?: string[]
}

export function ResumePdf({ data, highlightKeywords = [] }: ResumePdfProps) {
  const { personalInfo, sections } = data
  const sorted = [...sections].sort((a, b) => a.order - b.order).filter((s) => s.visible)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{personalInfo.fullName}</Text>
          <Text style={s.jobTitle}>{personalInfo.jobTitle}</Text>
          <Text style={s.contact}>
            {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' | ')}
          </Text>
        </View>
        {sorted.map((section) => (
          <PdfSection key={`${section.id}-${section.order}`} section={section} keywords={highlightKeywords} />
        ))}
      </Page>
    </Document>
  )
}

function PdfSectionHeader({ title }: { title: string }) {
  return (
    <View>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.divider} />
    </View>
  )
}

function PdfSection({ section, keywords }: { section: Section; keywords: string[] }) {
  switch (section.type) {
    case 'summary':
      return <PdfSummary section={section} keywords={keywords} />
    case 'work-experience':
      return <PdfWorkExperience section={section} keywords={keywords} />
    case 'education':
      return <PdfEducation section={section} />
    case 'skills':
      return <PdfSkills section={section} keywords={keywords} />
    case 'projects':
      return <PdfProjects section={section} keywords={keywords} />
    case 'certifications':
      return <PdfCertifications section={section} />
    case 'custom':
      return <PdfCustom section={section} keywords={keywords} />
    default:
      return null
  }
}

function PdfSummary({ section, keywords }: { section: SummarySection; keywords: string[] }) {
  if (!section.content) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      <Text>{highlightText(section.content, keywords)}</Text>
    </View>
  )
}

function PdfWorkExperience({ section, keywords }: { section: WorkExperienceSection; keywords: string[] }) {
  if (section.entries.length === 0) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      {section.entries.map((entry) => (
        <View key={entry.id} style={s.entryBlock}>
          <View style={s.entryRow}>
            <Text style={s.entryTitle}>{entry.title}</Text>
            <Text style={s.entryDate}>{entry.startDate} — {entry.current ? 'Present' : entry.endDate}</Text>
          </View>
          <Text style={s.entrySubtitle}>{entry.company}</Text>
          {entry.bullets.filter(Boolean).map((bullet, i) => (
            <Text key={i} style={s.bullet}>• {highlightText(bullet, keywords)}</Text>
          ))}
        </View>
      ))}
    </View>
  )
}

function PdfEducation({ section }: { section: EducationSection }) {
  if (section.entries.length === 0) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      {section.entries.map((entry) => (
        <View key={entry.id} style={s.entryRow}>
          <Text><Text style={s.bold}>{entry.degree}</Text> {entry.school}</Text>
          <Text style={s.entryDate}>{entry.startDate} — {entry.endDate}</Text>
        </View>
      ))}
    </View>
  )
}

function PdfSkills({ section, keywords }: { section: SkillsSection; keywords: string[] }) {
  if (section.categories.length === 0) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      {section.categories.map((cat) => (
        <Text key={cat.id} style={s.skillRow}>
          <Text style={s.bold}>{cat.name}:</Text> {highlightText(cat.skills.join(', '), keywords)}
        </Text>
      ))}
    </View>
  )
}

function PdfProjects({ section, keywords }: { section: ProjectsSection; keywords: string[] }) {
  if (section.entries.length === 0) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      {section.entries.map((entry) => (
        <View key={entry.id} style={s.entryBlock}>
          <Text style={s.entryTitle}>{entry.name}</Text>
          {entry.description && <Text>{highlightText(entry.description, keywords)}</Text>}
        </View>
      ))}
    </View>
  )
}

function PdfCertifications({ section }: { section: CertificationsSection }) {
  if (section.entries.length === 0) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      {section.entries.map((entry) => (
        <View key={entry.id} style={s.entryRow}>
          <Text><Text style={s.bold}>{entry.name}</Text> {entry.issuer}</Text>
          {entry.date && <Text style={s.entryDate}>{entry.date}</Text>}
        </View>
      ))}
    </View>
  )
}

function PdfCustom({ section, keywords }: { section: CustomSection; keywords: string[] }) {
  if (!section.content) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      <Text>{highlightText(section.content, keywords)}</Text>
    </View>
  )
}
