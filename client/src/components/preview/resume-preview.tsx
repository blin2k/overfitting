
import { PDFViewer } from '@react-pdf/renderer'
import { ResumePdf } from '@/components/preview/resume-pdf'
import { useResume } from '@/context/resume-context'

export function ResumePreview() {
  const { state } = useResume()

  return (
    <div className="flex h-full flex-col bg-[#F5F5F5]">
      <div className="flex-1 w-full p-4 md:p-8 pt-0">
        <PDFViewer width="100%" height="100%" className="border-none rounded-md shadow-sm">
          <ResumePdf data={state} />
        </PDFViewer>
      </div>
    </div>
  )
}
