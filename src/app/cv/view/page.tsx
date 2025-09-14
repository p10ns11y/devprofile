'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import CVDocument from '@/components/cv-document';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div>Loading PDF viewer...</div>
});

const CVPreviewPage = () => (
  <div style={{ height: '100vh' }}>
    <PDFViewer width="100%" height="100%">
      <CVDocument />
    </PDFViewer>
  </div>
);

export default CVPreviewPage;
