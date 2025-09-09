"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { DocumentSidebar } from '../components/DocumentSidebar';
import { DocumentViewer } from '../components/DocumentViewer';

interface DocumentItem {
  id: string;
  name: string;
  path: string;
  type: 'pdf' | 'image' | 'text' | 'other';
  size: number;
  lastModified: Date;
  thumbnail?: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize with available documents
  useEffect(() => {
    const initializeDocuments = async () => {
      const docs: DocumentItem[] = [
        // CV Document
        {
          id: 'cv-pdf',
          name: 'cv.pdf',
          path: '/cv.pdf',
          type: 'pdf',
          size: 1024000,
          lastModified: new Date(),
        },
        // Images
        {
          id: 'curism-png',
          name: 'curism.png',
          path: '/images/curism.png',
          type: 'image',
          size: 512000,
          lastModified: new Date(),
        },
        {
          id: 'fa3c8ca54c1f2364ce99b8b4a5843bf84d6e4b68-png',
          name: 'fa3c8ca54c1f2364ce99b8b4a5843bf84d6e4b68.png',
          path: '/images/fa3c8ca54c1f2364ce99b8b4a5843bf84d6e4b68.png',
          type: 'image',
          size: 1024000,
          lastModified: new Date(),
        },
        // Certificate PDFs
        {
          id: 'cert-coursera-0UXP2OPIYHPS',
          name: 'Coursera 0UXP2OPIYHPS.pdf',
          path: '/certificates/Coursera 0UXP2OPIYHPS.pdf',
          type: 'pdf',
          size: 256000,
          lastModified: new Date(),
        },
        {
          id: 'cert-coursera-A5O6UPSB1TU2',
          name: 'Coursera A5O6UPSB1TU2.pdf',
          path: '/certificates/Coursera A5O6UPSB1TU2.pdf',
          type: 'pdf',
          size: 256000,
          lastModified: new Date(),
        },
        {
          id: 'cert-coursera-CF3OFVOXL5DL',
          name: 'Coursera CF3OFVOXL5DL.pdf',
          path: '/certificates/Coursera CF3OFVOXL5DL.pdf',
          type: 'pdf',
          size: 256000,
          lastModified: new Date(),
        },
        {
          id: 'cert-coursera-dataproducts',
          name: 'Coursera-dataproducts.pdf',
          path: '/certificates/Coursera-dataproducts.pdf',
          type: 'pdf',
          size: 256000,
          lastModified: new Date(),
        },
        {
          id: 'cert-coursera-meteor',
          name: 'Coursera-Meteor.pdf',
          path: '/certificates/Coursera-Meteor.pdf',
          type: 'pdf',
          size: 256000,
          lastModified: new Date(),
        },
        {
          id: 'cert-coursera-ml',
          name: 'Coursera-ML.pdf',
          path: '/certificates/Coursera-ML.pdf',
          type: 'pdf',
          size: 256000,
          lastModified: new Date(),
        },
      ];

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
      className="min-h-screen bg-background text-foreground"
    >
      <Header />

      <main className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <DocumentSidebar
            documents={documents}
            selectedDocument={selectedDocument}
            onDocumentSelect={handleDocumentSelect}
            loading={loading}
          />
        </div>

        {/* Document Viewer */}
        <div className="flex-1 bg-gray-50">
          <DocumentViewer
            document={selectedDocument}
            loading={loading}
          />
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
