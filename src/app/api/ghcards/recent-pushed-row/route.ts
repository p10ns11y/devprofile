import {
  fetchRecentRepos,
  generateRecentPushedErrorSvg,
  generateRecentPushedRowSvg,
  parseIndex,
  repoAtIndex,
  svgResponseHeaders,
} from "@/lib/ghcards/recent-pushed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "p10ns11y";
  const index = parseIndex(searchParams.get("index"));

  if (index === null) {
    return new Response(generateRecentPushedErrorSvg("Missing or invalid index"), {
      headers: { "Content-Type": "image/svg+xml" },
      status: 400,
    });
  }

  try {
    const recentRepos = await fetchRecentRepos(username);
    const repo = repoAtIndex(recentRepos, index);
    if (!repo) {
      return new Response(generateRecentPushedErrorSvg("Repository row not found"), {
        headers: { "Content-Type": "image/svg+xml" },
        status: 404,
      });
    }

    return new Response(generateRecentPushedRowSvg(repo, index), { headers: svgResponseHeaders });
  } catch {
    return new Response(generateRecentPushedErrorSvg(), {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
