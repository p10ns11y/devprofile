'use client'

import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import CVDocument from '@/components/cv-document';

const CVPreviewPage = () => (
  <div style={{ height: '100vh' }}>
    <PDFViewer width="100%" height="100%">
      <CVDocument />
    </PDFViewer>
  </div>
);

export default CVPreviewPage;
