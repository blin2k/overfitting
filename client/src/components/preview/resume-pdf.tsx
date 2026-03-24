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

interface ResumePdfProps {
  data: ResumeData
}

export function ResumePdf({ data }: ResumePdfProps) {
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
          <PdfSection key={`${section.id}-${section.order}`} section={section} />
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

function PdfSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'summary':
      return <PdfSummary section={section} />
    case 'work-experience':
      return <PdfWorkExperience section={section} />
    case 'education':
      return <PdfEducation section={section} />
    case 'skills':
      return <PdfSkills section={section} />
    case 'projects':
      return <PdfProjects section={section} />
    case 'certifications':
      return <PdfCertifications section={section} />
    case 'custom':
      return <PdfCustom section={section} />
    default:
      return null
  }
}

function PdfSummary({ section }: { section: SummarySection }) {
  if (!section.content) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      <Text>{section.content}</Text>
    </View>
  )
}

function PdfWorkExperience({ section }: { section: WorkExperienceSection }) {
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
            <Text key={i} style={s.bullet}>• {bullet}</Text>
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

function PdfSkills({ section }: { section: SkillsSection }) {
  if (section.categories.length === 0) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      {section.categories.map((cat) => (
        <Text key={cat.id} style={s.skillRow}>
          <Text style={s.bold}>{cat.name}:</Text> {cat.skills.join(', ')}
        </Text>
      ))}
    </View>
  )
}

function PdfProjects({ section }: { section: ProjectsSection }) {
  if (section.entries.length === 0) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      {section.entries.map((entry) => (
        <View key={entry.id} style={s.entryBlock}>
          <Text style={s.entryTitle}>{entry.name}</Text>
          {entry.description && <Text>{entry.description}</Text>}
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

function PdfCustom({ section }: { section: CustomSection }) {
  if (!section.content) return null
  return (
    <View>
      <PdfSectionHeader title={section.title} />
      <Text>{section.content}</Text>
    </View>
  )
}
