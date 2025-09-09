import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import CVDocument from '@/components/CVDocument';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePDF() {
  try {
    console.log('Generating PDF...');

    // Ensure public directory exists
    const publicDir = join(__dirname, '..', 'public');
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    // Generate PDF
    const pdfPath = join(publicDir, 'cv.pdf');
    await ReactPDF.render(<CVDocument />, pdfPath);

    console.log('PDF generated successfully at:', pdfPath);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

generatePDF();