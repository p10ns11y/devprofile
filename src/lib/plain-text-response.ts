import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const PLAIN_TEXT_CONTENT_TYPE = "text/plain; charset=utf-8";

export async function readProjectTextFile(relativePath: string): Promise<string> {
  return readFile(join(process.cwd(), relativePath), "utf8");
}

export function plainTextResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": PLAIN_TEXT_CONTENT_TYPE,
      "Cache-Control": "public, max-age=600, stale-while-revalidate=86400",
    },
  });
}
