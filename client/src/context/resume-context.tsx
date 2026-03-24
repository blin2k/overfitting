import { createContext, useContext, useReducer, useEffect, useRef, useState, type ReactNode } from 'react'
import type {
  ResumeData,
  PersonalInfo,
  Section,
  SectionType,
  WorkExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
} from '@/types/resume'
import { DEFAULT_RESUME } from '@/lib/resume-defaults'
import { fetchResume, saveResumeToServer } from '@/lib/api'

// Actions
export type ResumeAction =
  | { type: 'SET_RESUME'; payload: ResumeData }
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'ADD_SECTION'; payload: { sectionType: SectionType; title?: string; id?: string } }
  | { type: 'REMOVE_SECTION'; payload: { sectionId: string } }
  | { type: 'UPDATE_SECTION'; payload: { sectionId: string; data: Partial<Section> } }
  | { type: 'REORDER_SECTIONS'; payload: { sectionIds: string[] } }
  | { type: 'ADD_ENTRY'; payload: { sectionId: string } }
  | { type: 'UPDATE_ENTRY'; payload: { sectionId: string; entryId: string; data: Record<string, unknown> } }
  | { type: 'REMOVE_ENTRY'; payload: { sectionId: string; entryId: string } }

function createDefaultSection(sectionType: SectionType, order: number, title?: string, id?: string): Section {
  const base = {
    id: id || crypto.randomUUID(),
    order,
    visible: true,
  }

  switch (sectionType) {
    case 'summary':
      return { ...base, type: 'summary', title: title ?? 'Summary', content: '' }
    case 'work-experience':
      return { ...base, type: 'work-experience', title: title ?? 'Work Experience', entries: [] }
    case 'education':
      return { ...base, type: 'education', title: title ?? 'Education', entries: [] }
    case 'skills':
      return { ...base, type: 'skills', title: title ?? 'Skills', categories: [] }
    case 'projects':
      return { ...base, type: 'projects', title: title ?? 'Projects', entries: [] }
    case 'certifications':
      return { ...base, type: 'certifications', title: title ?? 'Certifications', entries: [] }
    case 'custom':
      return { ...base, type: 'custom', title: title ?? 'Custom Section', content: '' }
  }
}

function createDefaultEntry(section: Section): Record<string, unknown> {
  const id = crypto.randomUUID()
  switch (section.type) {
    case 'work-experience':
      return { id, title: '', company: '', startDate: '', endDate: '', current: false, bullets: [''] }
    case 'education':
      return { id, degree: '', school: '', startDate: '', endDate: '' }
    case 'projects':
      return { id, name: '', description: '' }
    case 'certifications':
      return { id, name: '', issuer: '', date: '' }
    case 'skills':
      return { id, name: '', skills: [] }
    default:
      return { id }
  }
}

function resumeReducer(state: ResumeData, action: ResumeAction): ResumeData {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SET_RESUME':
      return action.payload

    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: { ...state.personalInfo, ...action.payload },
        updatedAt: now,
      }

    case 'ADD_SECTION': {
      const newSection = createDefaultSection(
        action.payload.sectionType,
        state.sections.length,
        action.payload.title,
        action.payload.id,
      )
      return {
        ...state,
        sections: [...state.sections, newSection],
        updatedAt: now,
      }
    }

    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections
          .filter((s) => s.id !== action.payload.sectionId)
          .map((s, i) => ({ ...s, order: i })),
        updatedAt: now,
      }

    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.sectionId ? { ...s, ...action.payload.data } as Section : s,
        ),
        updatedAt: now,
      }

    case 'REORDER_SECTIONS': {
      const idOrder = action.payload.sectionIds
      const reordered = idOrder
        .map((id, i) => {
          const section = state.sections.find((s) => s.id === id)
          return section ? { ...section, order: i } : null
        })
        .filter((s): s is Section => s !== null)
      return { ...state, sections: reordered, updatedAt: now }
    }

    case 'ADD_ENTRY': {
      const section = state.sections.find((s) => s.id === action.payload.sectionId)
      if (!section) return state
      const entry = createDefaultEntry(section)
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.payload.sectionId) return s
          switch (s.type) {
            case 'work-experience':
              return { ...s, entries: [...s.entries, entry] } as WorkExperienceSection
            case 'education':
              return { ...s, entries: [...s.entries, entry] } as EducationSection
            case 'projects':
              return { ...s, entries: [...s.entries, entry] } as ProjectsSection
            case 'certifications':
              return { ...s, entries: [...s.entries, entry] } as CertificationsSection
            case 'skills':
              return { ...s, categories: [...s.categories, entry] } as unknown as SkillsSection
            default:
              return s
          }
        }),
        updatedAt: now,
      }
    }

    case 'UPDATE_ENTRY': {
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.payload.sectionId) return s
          switch (s.type) {
            case 'work-experience':
              return {
                ...s,
                entries: s.entries.map((e) =>
                  e.id === action.payload.entryId ? { ...e, ...action.payload.data } : e,
                ),
              } as WorkExperienceSection
            case 'education':
              return {
                ...s,
                entries: s.entries.map((e) =>
                  e.id === action.payload.entryId ? { ...e, ...action.payload.data } : e,
                ),
              } as EducationSection
            case 'projects':
              return {
                ...s,
                entries: s.entries.map((e) =>
                  e.id === action.payload.entryId ? { ...e, ...action.payload.data } : e,
                ),
              } as ProjectsSection
            case 'certifications':
              return {
                ...s,
                entries: s.entries.map((e) =>
                  e.id === action.payload.entryId ? { ...e, ...action.payload.data } : e,
                ),
              } as CertificationsSection
            case 'skills':
              return {
                ...s,
                categories: s.categories.map((c) =>
                  c.id === action.payload.entryId ? { ...c, ...action.payload.data } : c,
                ),
              } as SkillsSection
            default:
              return s
          }
        }),
        updatedAt: now,
      }
    }

    case 'REMOVE_ENTRY': {
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.payload.sectionId) return s
          switch (s.type) {
            case 'work-experience':
              return { ...s, entries: s.entries.filter((e) => e.id !== action.payload.entryId) } as WorkExperienceSection
            case 'education':
              return { ...s, entries: s.entries.filter((e) => e.id !== action.payload.entryId) } as EducationSection
            case 'projects':
              return { ...s, entries: s.entries.filter((e) => e.id !== action.payload.entryId) } as ProjectsSection
            case 'certifications':
              return { ...s, entries: s.entries.filter((e) => e.id !== action.payload.entryId) } as CertificationsSection
            case 'skills':
              return { ...s, categories: s.categories.filter((c) => c.id !== action.payload.entryId) } as SkillsSection
            default:
              return s
          }
        }),
        updatedAt: now,
      }
    }

    default:
      return state
  }
}

// Context
interface ResumeContextValue {
  state: ResumeData
  dispatch: React.Dispatch<ResumeAction>
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resumeReducer, DEFAULT_RESUME)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResume().then(res => {
      if (res) dispatch({ type: 'SET_RESUME', payload: res })
      setIsLoading(false)
    })
  }, [])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveResumeToServer(state)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [state, isLoading])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading resume...</div>
  }

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}
