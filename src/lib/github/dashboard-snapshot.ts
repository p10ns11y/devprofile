import { fetchGitHubJson } from "./client";
import { getCreativeProjectSlugs } from "./creative-projects";

export type CreativeProjectEntry = {
  fullName: string;
  repo: Record<string, unknown> | null;
  topics: string[];
};

export type GitHubDashboardSnapshot = {
  username: string;
  user: Record<string, unknown>;
  repos: Record<string, unknown>[];
  creativeProjects: CreativeProjectEntry[];
  fetchedAt: number;
};

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/;

export function normalizeGitHubUsername(raw: string | null): string {
  const username = (raw ?? "p10ns11y").trim();
  if (!USERNAME_RE.test(username)) {
    throw new Error("Invalid GitHub username");
  }
  return username;
}

async function fetchCreativeProject(
  fullName: string,
  reposList: Record<string, unknown>[]
): Promise<CreativeProjectEntry> {
  const fromList = reposList.find(
    (r) =>
      String(r.full_name ?? "")
        .toLowerCase() === fullName.toLowerCase()
  );

  try {
    const repo = await fetchGitHubJson<Record<string, unknown>>(
      `https://api.github.com/repos/${fullName}`,
      { next: { revalidate: 6 * 60 * 60 } }
    );
    return {
      fullName,
      repo,
      topics: Array.isArray(repo.topics) ? (repo.topics as string[]) : [],
    };
  } catch {
    if (fromList) {
      return {
        fullName,
        repo: fromList,
        topics: Array.isArray(fromList.topics) ? (fromList.topics as string[]) : [],
      };
    }
    return { fullName, repo: null, topics: [] };
  }
}

/** Server-side: one snapshot for the live dashboard (used by /api/github/dashboard). */
export async function fetchDashboardSnapshot(
  username: string
): Promise<GitHubDashboardSnapshot> {
  const [user, repos] = await Promise.all([
    fetchGitHubJson<Record<string, unknown>>(
      `https://api.github.com/users/${username}`,
      { next: { revalidate: 6 * 60 * 60 } }
    ),
    fetchGitHubJson<Record<string, unknown>[]>(
      `https://api.github.com/users/${username}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
      { next: { revalidate: 6 * 60 * 60 } }
    ),
  ]);

  const creativeProjects = await Promise.all(
    getCreativeProjectSlugs().map((fullName) => fetchCreativeProject(fullName, repos))
  );

  return {
    username,
    user,
    repos,
    creativeProjects,
    fetchedAt: Date.now(),
  };
}
