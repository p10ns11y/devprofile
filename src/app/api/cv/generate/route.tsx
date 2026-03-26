import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import CVDocument from '@/components/cv-document';

export async function GET() {
  try {
    const pdfBuffer = await renderToBuffer(<CVDocument />);

    // Convert buffer to Uint8Array for Response compatibility
    const arrayBuffer = new Uint8Array(pdfBuffer);

    // Set headers for direct download
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="peramanathan-sathyamoorthy-cv.pdf"',
        'Cache-Control': 'max-age=600, stale-while-revalidate=7200',
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
