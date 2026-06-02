#!/usr/bin/env node
/**
 * CI check: visible certificates have unique base64url ids, files on disk, and digests match.
 */
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cvData = JSON.parse(
  await fs.readFile(path.join(root, "src/data/cvdata.json"), "utf8")
);

const hiddenFilenames = new Set([
  "polaris-ht101-certificate-template.png",
  "polaris-ht101-social-certificate-template.png",
]);
const hiddenCoursePattern = /human trafficking/i;

function isHidden(cert) {
  if (hiddenFilenames.has(cert.filename)) return true;
  return hiddenCoursePattern.test(cert.course ?? "");
}

function certificateIdFromFilename(filename) {
  return Buffer.from(filename, "utf8").toString("base64url");
}

function resolveAlgorithm(cert) {
  const raw = cert.hashAlgorithm ?? "sha256";
  return raw === "blake3" ? "blake3" : "sha256";
}

function expectedHex(cert, algorithm) {
  if (algorithm === "blake3") {
    return cert.blake3Hash?.trim().toLowerCase() ?? null;
  }
  return cert.sha256Hash?.trim().toLowerCase() ?? null;
}

async function sha256Hex(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

let failed = false;

const visible = cvData.certificates.filter((cert) => !isHidden(cert));
const ids = new Set();

for (const cert of visible) {
  const id = certificateIdFromFilename(cert.filename);
  if (ids.has(id)) {
    console.error(`Duplicate certificate id for ${cert.filename}`);
    failed = true;
  }
  ids.add(id);

  const algorithm = resolveAlgorithm(cert);
  const expected = expectedHex(cert, algorithm);
  if (!expected) {
    console.error(`Missing ${algorithm} digest for ${cert.filename}`);
    failed = true;
    continue;
  }

  const filePath = path.join(root, "public/certificates", cert.filename);
  try {
    await fs.access(filePath);
  } catch {
    console.error(`Missing file: ${cert.filename}`);
    failed = true;
    continue;
  }

  if (algorithm === "sha256") {
    const actual = await sha256Hex(filePath);
    if (actual !== expected) {
      console.error(`SHA-256 mismatch for ${cert.filename}`);
      failed = true;
    }
  } else {
    console.error(
      `BLAKE3 configured for ${cert.filename} but validate-certificates only checks sha256 (register provider + extend script)`
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Validated ${visible.length} visible certificates.`);
