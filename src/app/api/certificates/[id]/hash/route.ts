import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import cvData from '@/data/cvdata.json';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: certificateId } = await params;

    // Validate certificate ID format
    if (!certificateId || typeof certificateId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid certificate ID' },
        { status: 400 }
      );
    }

    // Find the certificate by ID to get the filename
    // We need to recreate the same logic as getCertificatesData
    let targetFilename: string | null = null;
    for (let index = 0; index < cvData.certificates.length; index++) {
      const cert = cvData.certificates[index];
      const filenameWithoutExt = cert.filename.replace(/\.[^/.]+$/, '');
      const sanitizedName = filenameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const uniqueId = `cert-${sanitizedName}-${index}`;

      if (uniqueId === certificateId) {
        targetFilename = cert.filename;
        break;
      }
    }

    if (!targetFilename) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'certificates', targetFilename);
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    const resolvedPath = path.resolve(filePath);
   
   // Ensure the resolved path is within the certificates directory
   if (!resolvedPath.startsWith(path.resolve(certificatesDir) + path.sep)) {
     return NextResponse.json(
       { error: 'Invalid certificate path' },
       { status: 400 }
     );
   }

    // Check if file exists
    try {
     await fs.access(resolvedPath);
    } catch {
      return NextResponse.json(
        { error: 'Certificate file not found' },
        { status: 404 }
      );
    }

   // Read file and calculate SHA-256 hash
   const fileBuffer = await fs.readFile(resolvedPath);
   const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Return hash with metadata
    return NextResponse.json({
      certificateId,
      filename: targetFilename,
      hash,
      algorithm: 'SHA-256',
      timestamp: new Date().toISOString(),
      fileSize: fileBuffer.length
    });

  } catch (error) {
    console.error('Hash calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}