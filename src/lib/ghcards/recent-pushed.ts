import { fetchGitHubJson } from "@/lib/github/client";
import {
  cardFooter,
  cardHeader,
  escapeXml,
  getLanguageColor,
  getTimeAgo,
  githubRepoUrl,
  svgExternalLink,
  truncateText,
  wrapSvg,
  wrapSvgSegment,
} from "@/app/api/ghcards/theme";

export type GitHubRepo = {
  name: string;
  fork: boolean;
  private: boolean;
  pushed_at?: string;
  updated_at?: string;
  language?: string | null;
  stargazers_count?: number;
};

export const CARD_WIDTH = 680;
export const HEADER_HEIGHT = 56;
export const ROW_HEIGHT = 48;
export const ROW_PADDING = 16;
export const FOOTER_HEIGHT = 32;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 10;

const ROW_W = CARD_WIDTH - 40;
const NAME_CLIP_WIDTH = 300;

const COL = {
  nameX: 14,
  langX: 328,
  starsX: 468,
  badgeX: 538,
  timeX: ROW_W - 12,
  nameMaxChars: 24,
  langMaxChars: 11,
} as const;

export function parseLimit(raw: string | null): number {
  return Math.min(parseInt(raw || String(DEFAULT_LIMIT), 10), MAX_LIMIT);
}

export function parseIndex(raw: string | null): number | null {
  if (raw === null || raw === "") return null;
  const index = parseInt(raw, 10);
  if (!Number.isFinite(index) || index < 0) return null;
  return index;
}

export async function fetchRecentRepos(username: string, limit = MAX_LIMIT): Promise<GitHubRepo[]> {
  const reposJson = await fetchGitHubJson<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
    { next: { revalidate: 300 } }
  );
  return reposJson.filter((repo) => !repo.fork && !repo.private).slice(0, limit);
}

export function repoAtIndex(repos: GitHubRepo[], index: number): GitHubRepo | null {
  return repos[index] ?? null;
}

function rowClipDef(index: number): string {
  return `<clipPath id="repo-name-${index}"><rect x="${COL.nameX}" y="0" width="${NAME_CLIP_WIDTH}" height="44"/></clipPath>`;
}

function rowInnerMarkup(repo: GitHubRepo, index: number): string {
  const timeAgo = getTimeAgo(repo.pushed_at || repo.updated_at);
  const langColor = getLanguageColor(repo.language);
  const isTop = index === 0;
  const displayName = truncateText(repo.name, COL.nameMaxChars);
  const displayLang = repo.language ? truncateText(repo.language, COL.langMaxChars) : null;

  return `
    <rect class="row" width="${ROW_W}" height="44" rx="8"/>
    <text x="${COL.nameX}" y="27" class="title" font-size="13" clip-path="url(#repo-name-${index})">${escapeXml(displayName)}</text>
    ${
      displayLang
        ? `
      <circle cx="${COL.langX}" cy="22" r="4" fill="${langColor}"/>
      <text x="${COL.langX + 10}" y="26" class="muted" font-size="10">${escapeXml(displayLang)}</text>
    `
        : ""
    }
    <text x="${COL.starsX}" y="26" class="star" font-size="11">★</text>
    <text x="${COL.starsX + 14}" y="26" class="muted" font-size="10">${repo.stargazers_count ?? 0}</text>
    <text x="${COL.timeX}" y="26" class="muted" font-size="10" text-anchor="end">${timeAgo}</text>
    ${
      isTop
        ? `
      <rect x="${COL.badgeX}" y="12" width="48" height="20" rx="10" class="badge-latest"/>
      <text x="${COL.badgeX + 24}" y="26" class="badge-latest-text" font-size="9" text-anchor="middle">Latest</text>
    `
        : ""
    }
  `;
}

function positionedRow(
  repo: GitHubRepo,
  index: number,
  username: string,
  y: number,
  linked: boolean
): string {
  const group = `<g transform="translate(20, ${y})">${rowInnerMarkup(repo, index)}</g>`;
  if (!linked) return group;
  return svgExternalLink(githubRepoUrl(username, repo.name), group);
}

export function generateRecentPushedRowSvg(repo: GitHubRepo, index: number): string {
  const body = positionedRow(repo, index, "", 2, false);
  return wrapSvgSegment(CARD_WIDTH, ROW_HEIGHT, body, "none", rowClipDef(index));
}

export function generateRecentPushedHeaderSvg(username: string): string {
  const height = HEADER_HEIGHT + ROW_PADDING;
  const body = cardHeader(CARD_WIDTH, "Recently Pushed", username, HEADER_HEIGHT);
  return wrapSvgSegment(CARD_WIDTH, height, body, "top");
}

export function generateRecentPushedFooterSvg(): string {
  const height = ROW_PADDING + FOOTER_HEIGHT;
  const body = cardFooter(CARD_WIDTH, height);
  return wrapSvgSegment(CARD_WIDTH, height, body, "bottom");
}

export function generateRecentPushedSvg(repos: GitHubRepo[], username: string): string {
  const height = HEADER_HEIGHT + repos.length * ROW_HEIGHT + ROW_PADDING + FOOTER_HEIGHT;
  const clipDefs = repos.map((_, index) => rowClipDef(index)).join("");

  const repoRows = repos
    .map((repo, index) => {
      const y = HEADER_HEIGHT + ROW_PADDING + index * ROW_HEIGHT;
      return positionedRow(repo, index, username, y, true);
    })
    .join("");

  const body = `
    ${cardHeader(CARD_WIDTH, "Recently Pushed", username, HEADER_HEIGHT)}
    ${repoRows}
    ${cardFooter(CARD_WIDTH, height)}
  `;

  return wrapSvg(CARD_WIDTH, height, body, clipDefs);
}

export function generateRecentPushedErrorSvg(message = "Failed to load recent activity"): string {
  return wrapSvg(
    CARD_WIDTH,
    120,
    `<text x="${CARD_WIDTH / 2}" y="64" class="error-title" font-size="14" text-anchor="middle">${escapeXml(message)}</text>`
  );
}

export const svgResponseHeaders = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
} as const;
