import { type NextRequest, NextResponse } from "next/server";

import { hashAlgorithmLabel } from "@/lib/certificates";
import { verifyHostedCertificateOnServer } from "@/lib/certificates/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: certificateId } = await params;

    if (!certificateId || typeof certificateId !== "string") {
      return NextResponse.json({ error: "Invalid certificate ID" }, { status: 400 });
    }

    const result = await verifyHostedCertificateOnServer(certificateId);
    if (!result) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...result,
      algorithmLabel: hashAlgorithmLabel(result.algorithm),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not configured") ? 501 : 500;
    if (status === 500) {
      console.error("Certificate verify error:", error);
    }
    return NextResponse.json({ error: message }, { status });
  }
}
