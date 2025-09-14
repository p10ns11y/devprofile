'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import CVDocument from '@/components/cv-document';

// Dynamically import PDFViewer to avoid SSR issues and handle ESM package
const PDFViewerWrapper = dynamic(
  () => import('@react-pdf/renderer').then((renderModule) => {
    const { PDFViewer } = renderModule;
    return function WrappedPDFViewer({ children, ...props }: any) {
      return React.createElement(PDFViewer, props, children);
    };
  }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen text-lg">Loading PDF viewer...</div>
  }
);

const CVPreviewPage = () => (
  <div style={{ height: '100vh' }}>
    <PDFViewerWrapper width="100%" height="100%">
      <CVDocument />
    </PDFViewerWrapper>
  </div>
);

export default CVPreviewPage;
