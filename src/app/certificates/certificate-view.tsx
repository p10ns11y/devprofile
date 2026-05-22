"use client";

import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DocumentSidebar } from "@/components/document-sidebar";
import { DocumentViewer } from "@/components/document-viewer";
import { getCertificatesData } from "@/data/documents-data";
import type { DocumentItem } from "@/types/documents";

const certificates = getCertificatesData();
const defaultCertificate = certificates[0] as DocumentItem;

export default function CertificateViewComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const certId = searchParams?.get("id");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedCertificate = useMemo(() => {
    if (certId) {
      const cert = certificates.find((c) => c.id === certId);
      if (cert) return cert;
    }
    return defaultCertificate;
  }, [certId]);

  useEffect(() => {
    if (!certId) {
      router.replace(`?id=${defaultCertificate.id}`, { scroll: false });
    }
  }, [certId, router]);

  const selectCertificate = (certificate: DocumentItem) => {
    router.replace(`?id=${certificate.id}`, { scroll: false });
    setSidebarOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Mobile Header */}
      <div className="md:hidden bg-surface1 border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text1">Certificates</h1>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-surface3 rounded-lg"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <main className="flex-1 flex relative">
        {/* Sidebar */}
        <div
          className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          fixed md:relative
          inset-y-0 left-0 z-40
          w-80 md:w-max
          max-h-screen
          bg-surface1 border-r border-border
          flex-shrink-0
          overflow-hidden
          transition-transform duration-300 ease-in-out
          md:transition-none
        `}
        >
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
        <div className="flex-1 bg-surface2 overflow-y-auto">
          <DocumentViewer document={selectedCertificate} />
        </div>
      </main>
    </motion.div>
  );
}
