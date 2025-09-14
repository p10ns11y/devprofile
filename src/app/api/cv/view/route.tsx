import { Readable } from 'stream';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import CVDocument from '@/components/cv-document';

export async function GET(request: Request) {
  try {
    const pdfStream = await ReactPDF.renderToStream(<CVDocument />);
    
    const webStream = Readable.toWeb(pdfStream as unknown as Readable)  as ReadableStream;

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