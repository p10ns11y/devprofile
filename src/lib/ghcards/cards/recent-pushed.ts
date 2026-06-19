import { fetchGitHubJson } from "@/lib/github/client";
import {
  escapeXml,
  getLanguageColor,
  getTimeAgo,
  githubRepoUrl,
  truncateText,
} from "@/app/api/ghcards/theme";
import type { GhcardsEmbedCard } from "../types";

export type GitHubRepo = {
  name: string;
  fork: boolean;
  private: boolean;
  pushed_at?: string;
  updated_at?: string;
  language?: string | null;
  stargazers_count?: number;
};

const ROW_W = 640;
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

async function fetchRecentRepos(username: string, limit: number): Promise<GitHubRepo[]> {
  const reposJson = await fetchGitHubJson<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
    { next: { revalidate: 300 } }
  );
  return reposJson.filter((repo) => !repo.fork && !repo.private).slice(0, limit);
}

function rowClipDef(index: number): string {
  return `<clipPath id="repo-name-${index}"><rect x="${COL.nameX}" y="0" width="${NAME_CLIP_WIDTH}" height="44"/></clipPath>`;
}

function renderRowInner(repo: GitHubRepo, index: number): string {
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

export const recentPushedCard: GhcardsEmbedCard<GitHubRepo> = {
  id: "recent-pushed",
  headerTitle: "Recently Pushed",
  cardWidth: 680,
  headerHeight: 56,
  rowHeight: 48,
  rowPadding: 16,
  footerHeight: 32,
  defaultLimit: 10,
  maxLimit: 10,
  fetch: fetchRecentRepos,
  rowClipDef,
  renderRowInner,
  resolveLink: (repo, username) => githubRepoUrl(username, repo.name),
  errorMessage: "Failed to load recent activity",
};
