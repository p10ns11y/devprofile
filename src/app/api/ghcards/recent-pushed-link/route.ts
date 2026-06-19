import { githubRepoUrl } from "@/app/api/ghcards/theme";
import { fetchRecentRepos, parseIndex, repoAtIndex } from "@/lib/ghcards/recent-pushed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "p10ns11y";
  const index = parseIndex(searchParams.get("index"));

  if (index === null) {
    return new Response("Missing or invalid index", { status: 400 });
  }

  try {
    const recentRepos = await fetchRecentRepos(username);
    const repo = repoAtIndex(recentRepos, index);
    if (!repo) {
      return new Response("Repository row not found", { status: 404 });
    }

    return Response.redirect(githubRepoUrl(username, repo.name), 302);
  } catch {
    return new Response("Failed to resolve repository link", { status: 500 });
  }
}
