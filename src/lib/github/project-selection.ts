import { getProjectsPolicy, type ProjectsPolicy } from "./projects-policy";

export type RepoLike = Record<string, unknown>;

export type ProjectCardEntry = {
  fullName: string;
  repo: RepoLike;
  topics: string[];
  score: number;
  latestCommit?: { sha: string; url: string; pushedAt: string };
  latestPr?: { number: number; url: string; title: string; state: string };
};

export type SelectedProjects = {
  featuredProjects: ProjectCardEntry[];
  recentProjects: ProjectCardEntry[];
};

function getFullName(repo: RepoLike): string {
  const full = repo.full_name;
  if (typeof full === "string" && full.includes("/")) return full;
  const owner = (repo.owner as Record<string, unknown> | undefined)?.login;
  const name = repo.name;
  if (owner && name) return `${owner}/${name}`;
  return String(full ?? name ?? "unknown/unknown");
}

function normalize(n: string): string {
  return n.toLowerCase();
}

function topicsFor(repo: RepoLike, topicsByRepo: Record<string, string[]>, fullName: string): string[] {
  const fromMap = topicsByRepo[fullName] || topicsByRepo[normalize(fullName)];
  if (Array.isArray(fromMap)) return fromMap;
  const embedded = repo.topics;
  if (Array.isArray(embedded)) return embedded as string[];
  return [];
}

function intersects(a: string[], b: string[]): boolean {
  if (!a.length || !b.length) return false;
  const set = new Set(a.map((t) => normalize(t)));
  return b.some((q) => set.has(normalize(q)));
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return Infinity;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / (1000 * 3600 * 24);
}

function computeScore(repo: RepoLike, topics: string[], policy: ProjectsPolicy): number {
  const s = policy.scoring;
  let score = 0;

  if (intersects(topics, policy.qualityTopics)) {
    score += s.topicMatch ?? 50;
  }

  const days = daysSince(repo.pushed_at as string | undefined);
  const pushedMap = (s.pushedWithinDays ?? {}) as Record<string, number>;
  // award the highest (smallest window) bonus that applies
  let recency = 0;
  for (const [dStr, bonus] of Object.entries(pushedMap)) {
    const d = Number(dStr);
    if (days <= d) recency = Math.max(recency, bonus);
  }
  score += recency;

  if (typeof repo.description === "string" && repo.description.trim()) {
    score += s.hasDescription ?? 5;
  }

  const stars = Number(repo.stargazers_count ?? 0);
  if (stars > 0) {
    score += s.minStarsBonus ?? 1;
  }

  return score;
}

export function selectProjects(
  repos: RepoLike[],
  topicsByRepo: Record<string, string[]> = {},
  policy: ProjectsPolicy = getProjectsPolicy()
): SelectedProjects {
  const exclude = new Set(policy.excludeRepos.map(normalize));

  const nonExcluded = repos.filter((r) => {
    if (r.fork || r.private) return false;
    const fn = normalize(getFullName(r));
    if (exclude.has(fn)) return false;
    return true;
  });

  const withMeta = nonExcluded.map((r) => {
    const fn = getFullName(r);
    const topics = topicsFor(r, topicsByRepo, fn);
    return { repo: r, fullName: fn, topics };
  });

  // Featured: must have quality topic
  const featuredCandidates = withMeta
    .filter((w) => intersects(w.topics, policy.qualityTopics))
    .map((w) => ({
      fullName: w.fullName,
      repo: w.repo,
      topics: w.topics,
      score: computeScore(w.repo, w.topics, policy),
    } as ProjectCardEntry));

  featuredCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date((b.repo as any).pushed_at || 0).getTime() - new Date((a.repo as any).pushed_at || 0).getTime();
  });

  const featuredProjects = featuredCandidates.slice(0, policy.limits.featured);

  const featuredSet = new Set(featuredProjects.map((p) => normalize(p.fullName)));

  // Recent: everything non-excluded, newest first, minus featured
  const recentCandidates = withMeta
    .filter((w) => !featuredSet.has(normalize(w.fullName)))
    .sort((a, b) => {
      return new Date((b.repo as any).pushed_at || 0).getTime() - new Date((a.repo as any).pushed_at || 0).getTime();
    })
    .map((w) => ({
      fullName: w.fullName,
      repo: w.repo,
      topics: w.topics,
      score: 0,
    } as ProjectCardEntry));

  const recentProjects = recentCandidates.slice(0, policy.limits.recentActivity);

  return { featuredProjects, recentProjects };
}

/**
 * Client-friendly: when topics are embedded in the repo objects from /repos list.
 * Uses the same selection but pulls topics from repo when no map provided.
 */
export function selectFromReposList(repos: RepoLike[], policy = getProjectsPolicy()): SelectedProjects {
  return selectProjects(repos, {}, policy);
}
