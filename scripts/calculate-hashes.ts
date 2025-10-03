import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import cvData from '../src/data/cvdata.json';

async function calculateHashes() {
  console.log('🔐 Calculating SHA-256 hashes for certificates...\n');

  const certificates = cvData.certificates;
  const updatedCertificates = [];

  for (const cert of certificates) {
    const filePath = path.join(process.cwd(), 'public', 'certificates', cert.filename);

    try {
      // Check if file exists
      await fs.access(filePath);
      console.log(`📄 Processing: ${cert.filename}`);

      // Read file and calculate hash
      const fileBuffer = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Add hash to certificate data
      const updatedCert = {
        ...cert,
        sha256Hash: hash,
        fileSize: fileBuffer.length,
        lastVerified: new Date().toISOString()
      };

      updatedCertificates.push(updatedCert);
      console.log(`✅ Hash calculated: ${hash.slice(0, 16)}...`);

    } catch (error) {
      console.error(`❌ Error processing ${cert.filename}:`, error);
      // Keep original certificate if file not found
      updatedCertificates.push(cert);
    }
  }

  // Update cvdata.json
  const updatedData = {
    ...cvData,
    certificates: updatedCertificates
  };

  const outputPath = path.join(process.cwd(), 'src', 'data', 'cvdata.json');
  const tempPath = outputPath + '.tmp';

  await fs.writeFile(
    tempPath,
    JSON.stringify(updatedData, null, 2)
  );
  await fs.rename(tempPath, outputPath);

  console.log('\n🎉 Hash calculation complete!');
  console.log(`📊 Processed ${updatedCertificates.length} certificates`);
  console.log('💾 Hashes saved to cvdata.json');
}

calculateHashes().catch(console.error);