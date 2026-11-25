import { plainTextResponse, readProjectTextFile } from "@/lib/plain-text-response";

export async function GET(): Promise<Response> {
  const body = await readProjectTextFile("src/data/ideas.md");
  return plainTextResponse(body);
}
