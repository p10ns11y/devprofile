import {
  fetchDashboardSnapshot,
  normalizeGitHubUsername,
} from "@/lib/github/dashboard-snapshot";
import { hasGitHubToken } from "@/lib/github/client";

/** 6h (~4 origin fetches/day) — keep in sync with REFRESH_INTERVAL_MS in dashboard-cache-client.js */
export const revalidate = 21600;

/**
 * Authenticated GitHub proxy for the live dashboard.
 * - GITHUB_TOKEN on Vercel → 5k req/hr to GitHub (shared across all visitors)
 * - CDN caches JSON ~6h → one origin fetch serves many clients
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const username = normalizeGitHubUsername(searchParams.get("username"));
    const snapshot = await fetchDashboardSnapshot(username);

    return Response.json(snapshot, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200",
        "X-GitHub-Auth": hasGitHubToken() ? "token" : "anonymous",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load dashboard";
    const status = message.includes("Invalid GitHub username") ? 400 : 502;
    return Response.json({ error: message }, { status });
  }
}
