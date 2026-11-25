import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type CvPdfDisposition = "inline" | "attachment";

const FILENAME = "peramanathan-sathyamoorthy-cv.pdf";
const BUILD_ARTIFACT = join(process.cwd(), "public", "cv.pdf");

/** Serve the Typst PDF written by `pnpm generate-pdf` / prebuild from cvdata.json. */
async function loadCvPdfBytes(): Promise<Uint8Array> {
  const buffer = await readFile(BUILD_ARTIFACT);
  return new Uint8Array(buffer);
}

export async function buildCvPdfResponse(disposition: CvPdfDisposition) {
  const body = await loadCvPdfBytes();

  return new Response(Buffer.from(body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${FILENAME}"`,
      "Content-Length": body.length.toString(),
      "Last-Modified": new Date().toUTCString(),
      "Cache-Control": "private, no-cache, must-revalidate",
    },
  });
}
