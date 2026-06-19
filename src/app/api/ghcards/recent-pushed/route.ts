import {
  fetchRecentRepos,
  generateRecentPushedErrorSvg,
  generateRecentPushedFooterSvg,
  generateRecentPushedHeaderSvg,
  generateRecentPushedSvg,
  parseLimit,
  svgResponseHeaders,
} from "@/lib/ghcards/recent-pushed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "p10ns11y";
  const limit = parseLimit(searchParams.get("limit"));
  const part = searchParams.get("part");

  try {
    if (part === "header") {
      return new Response(generateRecentPushedHeaderSvg(username), { headers: svgResponseHeaders });
    }
    if (part === "footer") {
      return new Response(generateRecentPushedFooterSvg(), { headers: svgResponseHeaders });
    }

    const recentRepos = await fetchRecentRepos(username, limit);
    return new Response(generateRecentPushedSvg(recentRepos, username), { headers: svgResponseHeaders });
  } catch {
    return new Response(generateRecentPushedErrorSvg(), {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
