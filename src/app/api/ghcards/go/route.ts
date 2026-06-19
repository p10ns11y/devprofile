import { handleGoRequest } from "@/lib/ghcards/embed";

export async function GET(request: Request) {
  return handleGoRequest(request);
}
