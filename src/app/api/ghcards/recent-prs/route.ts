import { fetchGitHubJson } from "@/lib/github/client";
import {
  cardFooter,
  cardHeader,
  escapeXml,
  getTimeAgo,
  prStateBadge,
  wrapSvg,
} from "../theme";

type GitHubPullRequest = {
  title: string;
  number: number;
  updated_at: string;
  state: string;
  repository_url: string;
  pull_request?: { merged_at: string | null };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "p10ns11y";
  const limit = Math.min(parseInt(searchParams.get("limit") || "5", 10), 8);

  try {
    const data = await fetchGitHubJson<{ items?: GitHubPullRequest[] }>(
      `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=updated&order=desc&per_page=${limit}`,
      { next: { revalidate: 300 } }
    );
    const prs = data.items ?? [];

    const svg = generateRecentPRsSVG(prs, username);

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new Response(generateErrorSVG(), {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}

function generateRecentPRsSVG(prs: GitHubPullRequest[], username: string) {
  const width = 640;
  const headerHeight = 56;
  const rowHeight = 52;
  const padding = 20;
  const height = headerHeight + prs.length * rowHeight + padding + 28;
  const rowW = width - 40;

  const prRows = prs
    .map((pr, index) => {
      const y = headerHeight + padding + index * rowHeight;
      const repoName = pr.repository_url.split("/").pop() ?? "repo";
      const state = pr.pull_request?.merged_at ? "merged" : pr.state;
      const badge = prStateBadge(state);
      const title =
        pr.title.length > 52 ? `${pr.title.slice(0, 52)}…` : pr.title;

      return `
      <g transform="translate(20, ${y})">
        <rect class="row" width="${rowW}" height="44" rx="8"/>
        <text x="14" y="20" class="title" font-size="13">${escapeXml(title)}</text>
        <text x="14" y="36" class="muted" font-size="10">${escapeXml(repoName)} #${pr.number}</text>
        <rect x="${rowW - 118}" y="12" width="54" height="20" rx="10" class="${badge.bgClass}"/>
        <text x="${rowW - 91}" y="26" class="${badge.textClass}" font-size="10" text-anchor="middle">${badge.label}</text>
        <text x="${rowW - 14}" y="26" class="muted" font-size="10" text-anchor="end">${getTimeAgo(pr.updated_at)}</text>
      </g>
    `;
    })
    .join("");

  const body = `
    ${cardHeader(width, "Recent PR Activity", username, headerHeight)}
    ${prRows}
    ${cardFooter(width, height)}
  `;

  return wrapSvg(width, height, body);
}

function generateErrorSVG() {
  return wrapSvg(
    640,
    120,
    `<text x="320" y="64" class="error-title" font-size="14" text-anchor="middle">Failed to load PR activity</text>`
  );
}
