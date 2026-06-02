import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createElement } from "react";

export type CvPdfDisposition = "inline" | "attachment";

const FILENAME = "peramanathan-sathyamoorthy-cv.pdf";
const BUILD_ARTIFACT = join(process.cwd(), "public", "cv.pdf");

/** Fresh PDF via react-pdf (Node). Falls back to `public/cv.pdf` from `pnpm generate-pdf` if render fails. */
async function loadCvPdfBytes(): Promise<Uint8Array> {
  try {
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { default: CVDocument } = await import("@/components/cv-document");
    const buffer = await renderToBuffer(createElement(CVDocument));
    return new Uint8Array(buffer);
  } catch (error) {
    console.error("CV PDF live render failed, using build artifact:", error);
    const buffer = await readFile(BUILD_ARTIFACT);
    return new Uint8Array(buffer);
  }
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
