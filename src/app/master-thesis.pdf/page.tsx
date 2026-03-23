'use client'

import { DocumentViewer } from '@/components/document-viewer'
import type { DocumentItem } from '@/types/documents'

const document: DocumentItem = {
  id: 'master-thesis',
  name: 'Master Thesis',
  path: '/pdfs/master-thesis.pdf',
  type: 'pdf',
  size: 4590154,
  lastModified: new Date(),
}

export default function MasterThesisPage() {
  return (
    <DocumentViewer 
      document={document}
    />
  )
}