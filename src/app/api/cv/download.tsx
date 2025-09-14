import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In production/serverless environments, read the file from public directory
    const publicDir = path.join(process.cwd(), 'public');
    const pdfPath = path.join(publicDir, 'cv.pdf');

    if (fs.existsSync(pdfPath)) {
      // Read the PDF file from the filesystem
      const pdfBuffer = fs.readFileSync(pdfPath);

      // Set headers for direct download dialog
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="peramanathan-sathyamoorthy-cv.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      // Send the PDF data directly
      res.send(pdfBuffer);
    } else {
      // Fallback: try to fetch from the public URL (for when file doesn't exist in fs)
      const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
      const host = req.headers.host;
      const pdfUrl = `${protocol}://${host}/cv.pdf`;

      console.log('Fetching PDF from:', pdfUrl); // Debug logging

      const pdfResponse = await fetch(pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Vercel/1.0)',
        }
      });

      if (!pdfResponse.ok) {
        console.error('PDF fetch failed with status:', pdfResponse.status);
        return res.status(404).json({ error: 'PDF not found' });
      }

      // Get the PDF content as ArrayBuffer
      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const pdfBuffer = Buffer.from(pdfArrayBuffer);

      // Set headers for direct download dialog
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="peramanathan-sathyamoorthy-cv.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      // Send the PDF data directly
      res.send(pdfBuffer);
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
