'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Custom setter that updates both state and URL
  const selectCertificate = (certificate: DocumentItem) => {
    setSelectedCertificate(certificate);
    const url = new URL(window.location.href);
    url.searchParams.set('id', certificate.id);
    window.history.replaceState({}, '', url.toString());
    // Close sidebar on mobile after selection
    setSidebarOpen(false);
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
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Certificates</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <main className="flex-1 flex relative">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative
          inset-y-0 left-0 z-40
          w-80 md:w-max
          max-h-screen
          bg-white border-r border-gray-200
          flex-shrink-0
          overflow-hidden
          transition-transform duration-300 ease-in-out
          md:transition-none
        `}>
          <DocumentSidebar
            documents={certificates}
            selectedDocument={selectedCertificate}
            onDocumentSelect={selectCertificate}
          />
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <DocumentViewer
            document={selectedCertificate}
          />
        </div>
      </main>
    </motion.div>
  )
}
