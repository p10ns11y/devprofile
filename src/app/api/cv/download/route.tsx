import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // In production/serverless environments, read the file from public directory
    const publicDir = path.join(process.cwd(), 'public');
    const pdfPath = path.join(publicDir, 'cv.pdf');

    if (fs.existsSync(pdfPath)) {
      // Read the PDF file from the filesystem
      const pdfBuffer = fs.readFileSync(pdfPath);

      // Set headers for direct download dialog
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="peramanathan-sathyamoorthy-cv.pdf"',
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'max-age=600, stale-while-revalidate=7200',
        },
      });
    } else {
      // Fallback: try to fetch from the public URL (for when file doesn't exist in fs)
      const protocol = (req.headers.get('x-forwarded-proto') as string) || 'https';
      const host = req.headers.get('host');
      const pdfUrl = `${protocol}://${host}/cv.pdf`;

      console.log('Fetching PDF from:', pdfUrl); // Debug logging

      const pdfResponse = await fetch(pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Vercel/1.0)',
        }
      });

      if (!pdfResponse.ok) {
        console.error('PDF fetch failed with status:', pdfResponse.status);
        return new Response(JSON.stringify({ error: 'PDF not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get the PDF content as ArrayBuffer
      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const pdfBuffer = Buffer.from(pdfArrayBuffer);

      // Set headers for direct download dialog
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="peramanathan-sathyamoorthy-cv.pdf"',
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'max-age=600, stale-while-revalidate=7200',
        },
      });
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
