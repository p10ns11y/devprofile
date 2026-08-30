import {
  escapeXml,
  getTimeAgo,
  githubPrUrl,
  parseRepoPathFromApiUrl,
  prStateBadge,
} from "@/app/api/ghcards/theme";
import { fetchGitHubJson } from "@/lib/github/client";
import type { GhcardsEmbedCard } from "../types";

export type GitHubPullRequest = {
  title: string;
  number: number;
  updated_at: string;
  state: string;
  repository_url: string;
  html_url?: string;
  pull_request?: { merged_at: string | null };
};

const ROW_W = 600;

async function fetchRecentPrs(username: string, limit: number): Promise<GitHubPullRequest[]> {
  const data = await fetchGitHubJson<{ items?: GitHubPullRequest[] }>(
    `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=updated&order=desc&per_page=${limit}`,
    { next: { revalidate: 300 } }
  );
  return data.items ?? [];
}

function renderRowInner(pr: GitHubPullRequest): string {
  const repoName = pr.repository_url.split("/").pop() ?? "repo";
  const state = pr.pull_request?.merged_at ? "merged" : pr.state;
  const badge = prStateBadge(state);
  const title = pr.title.length > 52 ? `${pr.title.slice(0, 52)}…` : pr.title;

  return `
    <rect class="row" width="${ROW_W}" height="44" rx="8"/>
    <text x="14" y="20" class="title" font-size="13">${escapeXml(title)}</text>
    <text x="14" y="36" class="muted" font-size="10">${escapeXml(repoName)} #${pr.number}</text>
    <rect x="${ROW_W - 118}" y="12" width="54" height="20" rx="10" class="${badge.bgClass}"/>
    <text x="${ROW_W - 91}" y="26" class="${badge.textClass}" font-size="10" text-anchor="middle">${badge.label}</text>
    <text x="${ROW_W - 14}" y="26" class="muted" font-size="10" text-anchor="end">${getTimeAgo(pr.updated_at)}</text>
  `;
}

export const recentPrsCard: GhcardsEmbedCard<GitHubPullRequest> = {
  id: "recent-prs",
  headerTitle: "Recent PR Activity",
  cardWidth: 640,
  headerHeight: 56,
  rowHeight: 52,
  rowPadding: 20,
  footerHeight: 28,
  defaultLimit: 5,
  maxLimit: 8,
  fetch: fetchRecentPrs,
  renderRowInner: (pr, _index) => renderRowInner(pr),
  resolveLink: (pr) => pr.html_url ?? githubPrUrl(pr.repository_url, pr.number),
  stableKey: (pr) => {
    const repo = parseRepoPathFromApiUrl(pr.repository_url) ?? "";
    return { repo, number: String(pr.number) };
  },
  parseStableParams: (searchParams) => {
    const repo = searchParams.get("repo");
    const number = searchParams.get("number");
    return repo && number ? { repo, number } : null;
  },
  resolveStableLink: (key) =>
    key.repo && key.number ? `https://github.com/${key.repo}/pull/${key.number}` : null,
  errorMessage: "Failed to load PR activity",
};
