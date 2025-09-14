import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import CVDocument from '@/components/cv-document';

export async function GET(request: Request) {
  try {
    const pdfBuffer = await renderToBuffer(<CVDocument />);

    // Convert buffer to Uint8Array for Response compatibility
    const arrayBuffer = new Uint8Array(pdfBuffer);

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
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
