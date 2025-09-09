import { NextApiRequest, NextApiResponse } from 'next';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import CVDocument from '@/components/CVDocument';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Generate PDF using ReactPDF.renderToStream
    const pdfStream = await ReactPDF.renderToStream(<CVDocument />);

    // Set headers for direct download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="peramanathan-sathyamoorthy-cv.pdf"');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

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
