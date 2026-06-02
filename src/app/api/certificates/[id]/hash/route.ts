import crypto from "crypto";
import { promises as fs } from "fs";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import { findCertificateById } from "@/lib/certificate-id";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: certificateId } = await params;

    if (!certificateId || typeof certificateId !== "string") {
      return NextResponse.json({ error: "Invalid certificate ID" }, { status: 400 });
    }

    const cert = findCertificateById(certificateId);
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const targetFilename = cert.filename;
    const filePath = path.join(process.cwd(), "public", "certificates", targetFilename);
    const certificatesDir = path.join(process.cwd(), "public", "certificates");
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(path.resolve(certificatesDir) + path.sep)) {
      return NextResponse.json({ error: "Invalid certificate path" }, { status: 400 });
    }

    try {
      await fs.access(resolvedPath);
    } catch {
      return NextResponse.json({ error: "Certificate file not found" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(resolvedPath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    return NextResponse.json({
      certificateId,
      filename: targetFilename,
      hash,
      algorithm: "SHA-256",
      timestamp: new Date().toISOString(),
      fileSize: fileBuffer.length,
    });
  } catch (error) {
    console.error("Hash calculation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
