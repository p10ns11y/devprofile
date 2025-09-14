import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import CVDocument from '@/components/cv-document';

export async function GET() {
  try {
    const pdfBuffer = await ReactPDF.renderToBuffer(<CVDocument />);
    
    // Set headers for direct download
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="peramanathan-sathyamoorthy-cv.pdf"',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
