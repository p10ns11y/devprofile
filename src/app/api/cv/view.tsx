import { NextApiRequest, NextApiResponse } from 'next';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import CVDocument from '@/components/cv-document';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set headers for PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="cv.pdf"');

    // Generate PDF using ReactPDF.renderToStream
    const pdfStream = await ReactPDF.renderToStream(<CVDocument />);

    // Pipe the PDF stream directly to the response
    pdfStream.pipe(res);

    // Handle stream errors
    pdfStream.on('error', (err: Error) => {
      console.error('PDF stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'PDF generation failed' });
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
