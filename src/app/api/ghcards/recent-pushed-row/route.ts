import { handleEmbedRequest } from "@/lib/ghcards/embed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!searchParams.has("card")) {
    searchParams.set("card", "recent-pushed");
  }
  if (!searchParams.has("part") && searchParams.has("index")) {
    searchParams.set("part", "row");
  }
  const url = new URL(request.url);
  url.search = searchParams.toString();
  return handleEmbedRequest(new Request(url));
}
