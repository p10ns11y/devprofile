import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Serve a fresh PDF from the API instead of the stale `public/cv.pdf` build artifact. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/cv.pdf") {
    return NextResponse.rewrite(new URL("/api/cv/view", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/cv.pdf",
};
