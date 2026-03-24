export interface ResumeData {
  id: string
  personalInfo: PersonalInfo
  sections: Section[]
  createdAt: string
  updatedAt: string
}

export interface PersonalInfo {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedinUrl: string
  portfolioWebsite: string
}

export type SectionType =
  | 'summary'
  | 'work-experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'custom'

export interface SectionBase {
  id: string
  type: SectionType
  title: string
  order: number
  visible: boolean
}

export interface SummarySection extends SectionBase {
  type: 'summary'
  content: string
}

export interface WorkExperienceSection extends SectionBase {
  type: 'work-experience'
  entries: WorkEntry[]
}

export interface WorkEntry {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface EducationSection extends SectionBase {
  type: 'education'
  entries: EducationEntry[]
}

export interface EducationEntry {
  id: string
  degree: string
  school: string
  startDate: string
  endDate: string
}

export interface SkillsSection extends SectionBase {
  type: 'skills'
  categories: SkillCategory[]
}

export interface SkillCategory {
  id: string
  name: string
  skills: string[]
}

export interface ProjectsSection extends SectionBase {
  type: 'projects'
  entries: ProjectEntry[]
}

export interface ProjectEntry {
  id: string
  name: string
  description: string
  url?: string
}

export interface CertificationsSection extends SectionBase {
  type: 'certifications'
  entries: CertificationEntry[]
}

export interface CertificationEntry {
  id: string
  name: string
  issuer: string
  date: string
}

export interface CustomSection extends SectionBase {
  type: 'custom'
  content: string
}

export type Section =
  | SummarySection
  | WorkExperienceSection
  | EducationSection
  | SkillsSection
  | ProjectsSection
  | CertificationsSection
  | CustomSection
