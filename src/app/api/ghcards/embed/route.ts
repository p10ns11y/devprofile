import { handleEmbedRequest } from "@/lib/ghcards/embed";

export async function GET(request: Request) {
  return handleEmbedRequest(request);
}
