import { handleGoRequest } from "@/lib/ghcards/embed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!searchParams.has("card")) {
    searchParams.set("card", "recent-pushed");
  }
  const url = new URL(request.url);
  url.search = searchParams.toString();
  return handleGoRequest(new Request(url));
}
