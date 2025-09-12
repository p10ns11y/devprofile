"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { DocumentSidebar } from '../components/DocumentSidebar';
import { DocumentViewer } from '../components/DocumentViewer';
import { DocumentItem } from '../types/documents';
import { getDocumentsData } from '../data/documentsData';

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize with available documents
  useEffect(() => {
    const initializeDocuments = async () => {
      const docs = getDocumentsData();

      setDocuments(docs);

      // Auto-select CV
      const cvDoc = docs.find(doc => doc.id === 'cv-pdf');
      if (cvDoc) {
        setSelectedDocument(cvDoc);
      }

      setLoading(false);
    };

    initializeDocuments();
  }, []);

  const handleDocumentSelect = (document: DocumentItem) => {
    setSelectedDocument(document);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen bg-background text-foreground"
    >
      {/* <Header /> */}

      <main className="flex-1 flex">
        {/* Sidebar */}
        <div className="max-h-screen w-max bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <DocumentSidebar
            documents={documents}
            selectedDocument={selectedDocument}
            onDocumentSelect={handleDocumentSelect}
            loading={loading}
          />
        </div>

        {/* Document Viewer */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <DocumentViewer
            document={selectedDocument}
            loading={loading}
          />
        </div>
      </main>

      {/* <Footer /> */}
    </motion.div>
  );
}
