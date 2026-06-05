import { fetchGitHubJson } from "./client";
import { type ProjectCardEntry, selectProjects } from "./project-selection";
import { getOwners } from "./projects-policy";
import { fetchTopicsForOwners, type TopicsByRepo } from "./repos-with-topics";

export type GitHubDashboardSnapshot = {
  username: string;
  user: Record<string, unknown>;
  repos: Record<string, unknown>[];
  /** @deprecated Use featuredProjects + recentProjects (from policy selection) */
  creativeProjects?: ProjectCardEntry[];
  featuredProjects: ProjectCardEntry[];
  recentProjects: ProjectCardEntry[];
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

async function enrichLatestCommit(
  fullName: string
): Promise<ProjectCardEntry["latestCommit"] | undefined> {
  try {
    const commits = await fetchGitHubJson<any[]>(
      `https://api.github.com/repos/${fullName}/commits?per_page=1`,
      { next: { revalidate: 3600 } }
    );
    const c = commits?.[0];
    if (!c) return undefined;
    const date = c.commit?.committer?.date || c.commit?.author?.date || "";
    return {
      sha: String(c.sha ?? ""),
      url: String(c.html_url ?? `https://github.com/${fullName}/commit/${c.sha}`),
      pushedAt: String(date),
    };
  } catch {
    return undefined;
  }
}

async function fetchUserRecentPRs(username: string, perPage = 100) {
  try {
    const data = await fetchGitHubJson<{ items?: any[] }>(
      `https://api.github.com/search/issues?q=author:${username}+type:pr+sort:updated&order=desc&per_page=${perPage}`,
      { next: { revalidate: 300 } }
    );
    return data.items ?? [];
  } catch {
    return [];
  }
}

function buildLatestPrPerRepo(
  prs: any[]
): Record<string, NonNullable<ProjectCardEntry["latestPr"]>> {
  const latest: Record<string, any> = {};
  for (const pr of prs) {
    const repoUrl: string = pr.repository_url || "";
    const match = repoUrl.match(/\/repos\/(.+)$/i);
    const fn = match ? match[1] : null;
    if (!fn || latest[fn]) continue; // first hit is most recently updated
    latest[fn] = {
      number: Number(pr.number),
      url: String(
        pr.html_url || pr.pull_request?.html_url || `https://github.com/${fn}/pull/${pr.number}`
      ),
      title: String(pr.title || ""),
      state: pr.pull_request?.merged_at ? "merged" : String(pr.state || "open"),
    };
    latest[fn.toLowerCase()] = latest[fn];
  }
  return latest;
}

async function fetchOwnerRepos(owner: string): Promise<Record<string, unknown>[]> {
  return fetchGitHubJson<Record<string, unknown>[]>(
    `https://api.github.com/users/${owner}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
    { next: { revalidate: 6 * 60 * 60 } }
  );
}

function mergeReposByFullName(repoLists: Record<string, unknown>[][]): Record<string, unknown>[] {
  const byName = new Map<string, Record<string, unknown>>();
  for (const list of repoLists) {
    for (const repo of list) {
      const fullName = String(repo.full_name ?? "").toLowerCase();
      if (fullName && !byName.has(fullName)) {
        byName.set(fullName, repo);
      }
    }
  }
  return [...byName.values()];
}

/** Server-side: one snapshot for the live dashboard (used by /api/github/dashboard).
 * Policy selection (high-quality topic + scoring) + GraphQL topics + commit/PR enrichment.
 */
export async function fetchDashboardSnapshot(username: string): Promise<GitHubDashboardSnapshot> {
  const owners = [...new Set([username, ...getOwners()])];

  const [user, ...ownerRepoLists] = await Promise.all([
    fetchGitHubJson<Record<string, unknown>>(`https://api.github.com/users/${username}`, {
      next: { revalidate: 6 * 60 * 60 },
    }),
    ...owners.map((owner) => fetchOwnerRepos(owner)),
  ]);

  const repos = mergeReposByFullName(ownerRepoLists);

  // Topics: prefer embedded in repos list; supplement with dedicated fetch for coverage
  const topicsFromList: TopicsByRepo = {};
  for (const r of repos) {
    const fn = String(r.full_name ?? "");
    if (fn && Array.isArray(r.topics)) {
      topicsFromList[fn] = r.topics as string[];
      topicsFromList[fn.toLowerCase()] = r.topics as string[];
    }
  }

  let topicsByRepo: TopicsByRepo = { ...topicsFromList };
  try {
    const extra = await fetchTopicsForOwners(
      owners,
      repos.map((r) => String(r.full_name ?? ""))
    );
    topicsByRepo = { ...topicsByRepo, ...extra };
  } catch {
    // topicsFromList is sufficient for the pushed list we have
  }

  const { featuredProjects, recentProjects } = selectProjects(repos, topicsByRepo, undefined, {
    recentOwner: username,
  });

  // Commit/PR links only on Recent Activity — not Featured (avoids noisy cards + nested link UI)
  const [prsForUser] = await Promise.all([
    fetchUserRecentPRs(username),
    Promise.all(
      recentProjects.map(async (entry) => {
        const commit = await enrichLatestCommit(entry.fullName);
        if (commit) (entry as ProjectCardEntry).latestCommit = commit;
      })
    ),
  ]);
  const prMap = buildLatestPrPerRepo(prsForUser);
  for (const entry of recentProjects) {
    const p = prMap[entry.fullName] || prMap[entry.fullName.toLowerCase()];
    if (p) (entry as ProjectCardEntry).latestPr = p;
  }

  // Back-compat alias for one transition (will be removed)
  const creativeProjects = featuredProjects; // intentional alias during rollout

  return {
    username,
    user,
    repos,
    creativeProjects,
    featuredProjects,
    recentProjects,
    fetchedAt: Date.now(),
  };
}
