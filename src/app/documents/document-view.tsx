'use client'

import { useState } from 'react';
import { motion } from 'motion/react';

import { DocumentSidebar } from "@/components/document-sidebar";
import { DocumentViewer } from "@/components/document-viewer";
import { DocumentItem } from "@/types/documents";
import { getDocumentsData } from "@/data/documents-data";

let documents = getDocumentsData();
let defaultDocument = documents.find(doc => doc.id === 'cv-pdf') as DocumentItem;

export default function DocumentViewComponent() {
  let [selectedDocument, setSelectedDocument] = useState<DocumentItem>(defaultDocument);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >

      <main className="flex-1 flex">
        <div className="max-h-screen w-max bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <DocumentSidebar
            documents={documents}
            selectedDocument={selectedDocument}
            onDocumentSelect={setSelectedDocument}
          />
        </div>

        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <DocumentViewer
            document={selectedDocument}
          />
        </div>
      </main>
    </motion.div>
  )
}
