'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';

import { DocumentSidebar } from "@/components/document-sidebar";
import { DocumentViewer } from "@/components/document-viewer";
import { DocumentItem } from "@/types/documents";
import { getCertificatesData } from "@/data/documents-data";

let certificates = getCertificatesData();
let defaultCertificate = certificates[0] as DocumentItem;

export default function CertificateViewComponent() {
  const searchParams = useSearchParams();
  const certId = searchParams?.get('id');

  const [selectedCertificate, setSelectedCertificate] = useState<DocumentItem>(defaultCertificate);

  // Custom setter that updates both state and URL
  const selectCertificate = (certificate: DocumentItem) => {
    setSelectedCertificate(certificate);
    const url = new URL(window.location.href);
    url.searchParams.set('id', certificate.id);
    window.history.replaceState({}, '', url.toString());
  };

  // Handle URL params after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (certId) {
      const cert = certificates.find(c => c.id === certId);
      if (cert && cert.id !== selectedCertificate.id) {
        setSelectedCertificate(cert);
      }
    } else {
      // Set initial URL if not present
      const url = new URL(window.location.href);
      url.searchParams.set('id', selectedCertificate.id);
      window.history.replaceState({}, '', url.toString());
    }
  }, [certId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >

      <main className="flex-1 flex">
        <div className="max-h-screen w-max bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <DocumentSidebar
            documents={certificates}
            selectedDocument={selectedCertificate}
            onDocumentSelect={selectCertificate}
          />
        </div>

        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <DocumentViewer
            document={selectedCertificate}
          />
        </div>
      </main>
    </motion.div>
  )
}
