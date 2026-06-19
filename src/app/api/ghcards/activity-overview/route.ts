import { fetchGitHubJson } from "@/lib/github/client";
import {
  cardFooter,
  cardHeader,
  escapeXml,
  getTimeAgo,
  githubPrUrl,
  githubRepoUrl,
  prStateBadge,
  svgExternalLink,
  wrapSvg,
} from "../theme";

type GitHubRepo = {
  name: string;
  fork: boolean;
  private: boolean;
  pushed_at?: string;
};

type GitHubPullRequest = {
  title: string;
  number: number;
  state: string;
  repository_url: string;
  html_url?: string;
  pull_request?: { merged_at: string | null };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "p10ns11y";

  try {
    const [reposJson, prsJson] = await Promise.all([
      fetchGitHubJson<GitHubRepo[] | { message?: string }>(
        `https://api.github.com/users/${username}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
        { next: { revalidate: 300 } }
      ),
      fetchGitHubJson<{ items?: GitHubPullRequest[] } | GitHubPullRequest[]>(
        `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=updated&order=desc&per_page=4`,
        { next: { revalidate: 300 } }
      ),
    ]);

    if (!Array.isArray(reposJson)) {
      throw new Error("Unexpected repos response");
    }

    const repos = reposJson.filter((r) => !r.fork && !r.private).slice(0, 5);

    const prs = Array.isArray(prsJson)
      ? prsJson
      : ((prsJson as { items?: GitHubPullRequest[] }).items ?? []);

    const svg = generateOverviewSVG(repos, prs, username);

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

function generateOverviewSVG(repos: GitHubRepo[], prs: GitHubPullRequest[], username: string) {
  const width = 720;
  const height = 400;
  const headerHeight = 56;
  const rowH = 44;
  const colW = 320;
  const startY = headerHeight + 28;

  const repoSection = repos
    .map((repo, i) => {
      const y = startY + i * rowH;
      return svgExternalLink(
        githubRepoUrl(username, repo.name),
        `
      <g transform="translate(24, ${y})">
        <rect class="row" width="${colW}" height="36" rx="8"/>
        <text x="12" y="23" class="title" font-size="13">${escapeXml(repo.name)}</text>
        <text x="${colW - 12}" y="23" class="muted" font-size="10" text-anchor="end">${getTimeAgo(repo.pushed_at)}</text>
      </g>
    `
      );
    })
    .join("");

  const prSection = prs
    .map((pr, i) => {
      const y = startY + i * rowH;
      const state = pr.pull_request?.merged_at ? "merged" : pr.state;
      const badge = prStateBadge(state);
      const title = pr.title.length > 36 ? `${pr.title.slice(0, 36)}…` : pr.title;

      const prUrl = pr.html_url ?? githubPrUrl(pr.repository_url, pr.number);

      return svgExternalLink(
        prUrl,
        `
      <g transform="translate(376, ${y})">
        <rect class="row" width="${colW}" height="36" rx="8"/>
        <text x="12" y="23" class="title" font-size="12">${escapeXml(title)}</text>
        <rect x="${colW - 62}" y="9" width="50" height="18" rx="9" class="${badge.bgClass}"/>
        <text x="${colW - 37}" y="22" class="${badge.textClass}" font-size="9" text-anchor="middle">${badge.label}</text>
      </g>
    `
      );
    })
    .join("");

  const body = `
    ${cardHeader(width, "Activity Overview", username, headerHeight)}
    <line x1="360" y1="${headerHeight + 12}" x2="360" y2="${height - 36}" class="divider"/>
    <text x="24" y="${headerHeight + 18}" class="subtitle" font-size="12">Recently pushed</text>
    <text x="376" y="${headerHeight + 18}" class="subtitle" font-size="12">Recent pull requests</text>
    ${repoSection}
    ${prSection}
    ${cardFooter(width, height)}
  `;

  return wrapSvg(width, height, body);
}

function generateErrorSVG() {
  return wrapSvg(
    720,
    120,
    `
    <text x="360" y="64" class="error-title" font-size="14" text-anchor="middle">Failed to load activity overview</text>
  `
  );
}
