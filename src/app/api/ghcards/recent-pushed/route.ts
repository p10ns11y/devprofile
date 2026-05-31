import { fetchGitHubJson } from "@/lib/github/client";
import {
  cardFooter,
  cardHeader,
  escapeXml,
  getLanguageColor,
  getTimeAgo,
  truncateText,
  wrapSvg,
} from "../theme";

type GitHubRepo = {
  name: string;
  fork: boolean;
  private: boolean;
  pushed_at?: string;
  updated_at?: string;
  language?: string | null;
  stargazers_count?: number;
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "p10ns11y";
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10),
    MAX_LIMIT
  );

  try {
    const reposJson = await fetchGitHubJson<GitHubRepo[]>(
      `https://api.github.com/users/${username}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
      { next: { revalidate: 300 } }
    );
    const recentRepos = reposJson
      .filter((r) => !r.fork && !r.private)
      .slice(0, limit);

    const svg = generateRecentPushedSVG(recentRepos, username);

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

function generateRecentPushedSVG(repos: GitHubRepo[], username: string) {
  const width = 680;
  const headerHeight = 56;
  const rowHeight = 48;
  const padding = 16;
  const height = headerHeight + repos.length * rowHeight + padding + 32;
  const rowW = width - 40;

  // Fixed columns (left → right): name | language | stars | [Latest] | time
  const nameClipWidth = 300;
  const col = {
    nameX: 14,
    langX: 328,
    starsX: 468,
    badgeX: 538,
    timeX: rowW - 12,
    nameMaxChars: 24,
    langMaxChars: 11,
  };

  const clipDefs = repos
    .map(
      (_, i) =>
        `<clipPath id="repo-name-${i}"><rect x="${col.nameX}" y="0" width="${nameClipWidth}" height="44"/></clipPath>`
    )
    .join("");

  const repoRows = repos
    .map((repo, index) => {
      const y = headerHeight + padding + index * rowHeight;
      const timeAgo = getTimeAgo(repo.pushed_at || repo.updated_at);
      const langColor = getLanguageColor(repo.language);
      const isTop = index === 0;
      const displayName = truncateText(repo.name, col.nameMaxChars);
      const displayLang = repo.language
        ? truncateText(repo.language, col.langMaxChars)
        : null;

      return `
      <g transform="translate(20, ${y})">
        <rect class="row" width="${rowW}" height="44" rx="8"/>
        <text x="${col.nameX}" y="27" class="title" font-size="13" clip-path="url(#repo-name-${index})">${escapeXml(displayName)}</text>
        ${
          displayLang
            ? `
          <circle cx="${col.langX}" cy="22" r="4" fill="${langColor}"/>
          <text x="${col.langX + 10}" y="26" class="muted" font-size="10">${escapeXml(displayLang)}</text>
        `
            : ""
        }
        <text x="${col.starsX}" y="26" class="star" font-size="11">★</text>
        <text x="${col.starsX + 14}" y="26" class="muted" font-size="10">${repo.stargazers_count ?? 0}</text>
        <text x="${col.timeX}" y="26" class="muted" font-size="10" text-anchor="end">${timeAgo}</text>
        ${
          isTop
            ? `
          <rect x="${col.badgeX}" y="12" width="48" height="20" rx="10" class="badge-latest"/>
          <text x="${col.badgeX + 24}" y="26" class="badge-latest-text" font-size="9" text-anchor="middle">Latest</text>
        `
            : ""
        }
      </g>
    `;
    })
    .join("");

  const body = `
    ${cardHeader(width, "Recently Pushed", username, headerHeight)}
    ${repoRows}
    ${cardFooter(width, height)}
  `;

  return wrapSvg(width, height, body, clipDefs);
}

function generateErrorSVG() {
  return wrapSvg(
    680,
    120,
    `<text x="340" y="64" class="error-title" font-size="14" text-anchor="middle">Failed to load recent activity</text>`
  );
}
