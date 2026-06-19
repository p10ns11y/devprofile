import { handleReadmeHtmlRequest } from "@/lib/ghcards/readme-html";

export async function GET(request: Request) {
  return handleReadmeHtmlRequest(request);
}
