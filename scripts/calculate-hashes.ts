import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import cvData from "../src/data/cvdata.json";
import {
  DEFAULT_CERTIFICATE_HASH_ALGORITHM,
  resolveCertificateHashAlgorithm,
} from "../src/lib/certificates/digest/algorithms";
import { bytesToHex } from "../src/lib/certificates/digest/bytes-to-hex";
import type { CvCertificateEntry } from "../src/lib/certificates/identity/id";

async function digestFile(
  algorithm: ReturnType<typeof resolveCertificateHashAlgorithm>,
  fileBuffer: Buffer
): Promise<string> {
  switch (algorithm) {
    case "sha256":
      return bytesToHex(new Uint8Array(crypto.createHash("sha256").update(fileBuffer).digest()));
    case "blake3":
      throw new Error(
        "BLAKE3 not configured in calculate-hashes. Register a Node provider or use sha256."
      );
  }
}

async function calculateHashes() {
  console.log("🔐 Calculating certificate digests...\n");

  const updatedCertificates = [];

  for (const cert of cvData.certificates as CvCertificateEntry[]) {
    const filePath = path.join(process.cwd(), "public", "certificates", cert.filename);
    const algorithm = resolveCertificateHashAlgorithm(cert);

    try {
      await fs.access(filePath);
      console.log(`📄 Processing: ${cert.filename} (${algorithm})`);

      const fileBuffer = await fs.readFile(filePath);
      const hex = await digestFile(algorithm, fileBuffer);

      const updatedCert = {
        ...cert,
        hashAlgorithm: cert.hashAlgorithm ?? DEFAULT_CERTIFICATE_HASH_ALGORITHM,
        ...(algorithm === "sha256" ? { sha256Hash: hex } : {}),
        ...(algorithm === "blake3" ? { blake3Hash: hex } : {}),
        fileSize: fileBuffer.length,
        lastVerified: new Date().toISOString(),
      };

      updatedCertificates.push(updatedCert);
      console.log(`✅ ${algorithm}: ${hex.slice(0, 16)}...`);
    } catch (error) {
      console.error(`❌ Error processing ${cert.filename}:`, error);
      updatedCertificates.push(cert);
    }
  }

  const outputPath = path.join(process.cwd(), "src", "data", "cvdata.json");
  const tempPath = `${outputPath}.tmp`;

  await fs.writeFile(
    tempPath,
    JSON.stringify({ ...cvData, certificates: updatedCertificates }, null, 2)
  );
  await fs.rename(tempPath, outputPath);

  console.log("\n🎉 Digest calculation complete!");
  console.log(`📊 Processed ${updatedCertificates.length} certificates`);
}

calculateHashes().catch(console.error);
