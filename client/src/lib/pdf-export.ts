import { pdf } from '@react-pdf/renderer'
import { createElement } from 'react'
import { ResumePdf } from '@/components/preview/resume-pdf'
import type { ResumeData } from '@/types/resume'

export async function exportPdf(data: ResumeData): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(createElement(ResumePdf, { data }) as any).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
