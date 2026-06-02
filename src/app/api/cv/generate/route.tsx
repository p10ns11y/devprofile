import { buildCvPdfResponse } from "@/lib/render-cv-pdf";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return await buildCvPdfResponse("attachment");
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
