import { Readable } from 'stream';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import CVDocument from '@/components/cv-document';

export async function GET(request: Request) {
  try {
    const pdfStream = await renderToStream(<CVDocument />);

    // Convert Node.js Readable stream to Web ReadableStream for Response
    const webStream = Readable.toWeb(pdfStream as any) as ReadableStream;

    return new Response(webStream, {
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
