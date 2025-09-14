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

      // Set headers for inline viewing (not download)
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="peramanathan-sathyamoorthy-cv.pdf"',
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      // Serve directly from public URL for inline viewing
      const protocol = (req.headers.get('x-forwarded-proto') as string) || 'https';
      const host = req.headers.get('host');
      const pdfUrl = `${protocol}://${host}/cv.pdf`;

      const pdfResponse = await fetch(pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Vercel/1.0)',
        }
      });

      if (!pdfResponse.ok) {
        return new Response(JSON.stringify({ error: 'PDF not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const pdfBuffer = Buffer.from(pdfArrayBuffer);

      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="peramanathan-sathyamoorthy-cv.pdf"',
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
