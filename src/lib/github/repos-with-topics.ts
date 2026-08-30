import { fetchGitHubJson, githubApiHeaders, hasGitHubToken } from "./client";

export type TopicsByRepo = Record<string, string[]>;

/**
 * GraphQL: fetch topics for up to ~100 repos per owner (affiliation OWNER).
 * One call per owner. Returns map fullName(lower) -> topics[]
 */
async function fetchWithGraphQL(owner: string): Promise<TopicsByRepo> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, affiliations: [OWNER], orderBy: { field: PUSHED_AT, direction: DESC }) {
          nodes {
            nameWithOwner
            repositoryTopics(first: 20) {
              nodes { topic { name } }
            }
          }
        }
      }
    }
  `;
  const headers = githubApiHeaders();
  const body = JSON.stringify({ query, variables: { login: owner } });
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body,
    // cache via next if in route
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GraphQL error ${res.status}: ${text}`);
  }
  const json = await res.json();
  const nodes = json?.data?.user?.repositories?.nodes ?? [];
  const map: TopicsByRepo = {};
  for (const node of nodes) {
    if (!node?.nameWithOwner) continue;
    const topics = (node.repositoryTopics?.nodes ?? [])
      .map((n: any) => n?.topic?.name)
      .filter(Boolean);
    map[node.nameWithOwner] = topics;
    map[node.nameWithOwner.toLowerCase()] = topics;
  }
  return map;
}

/**
 * REST fallback: fetch /repos for owner (gets topics embedded), or per-repo topics endpoint for candidates.
 * If we already have the main repos list, prefer using embedded .topics.
 */
async function fetchWithREST(owner: string, candidates: string[] = []): Promise<TopicsByRepo> {
  const map: TopicsByRepo = {};
  try {
    // Primary: the user repos list already includes topics in most cases
    const repos = await fetchGitHubJson<any[]>(
      `https://api.github.com/users/${owner}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
      { next: { revalidate: 6 * 60 * 60 } }
    );
    for (const r of repos) {
      const fn = r.full_name || `${owner}/${r.name}`;
      const topics = Array.isArray(r.topics) ? r.topics : [];
      map[fn] = topics;
      map[fn.toLowerCase()] = topics;
    }
  } catch {
    // ignore, try per-candidate
  }

  // If specific candidates and not covered, fetch /repos/{fn}/topics (requires token for some)
  const toFetch = candidates.filter((c) => !map[c] && !map[c.toLowerCase()]);
  await Promise.all(
    toFetch.slice(0, 30).map(async (full) => {
      try {
        const data = await fetchGitHubJson<{ names?: string[] }>(
          `https://api.github.com/repos/${full}/topics`,
          { next: { revalidate: 6 * 60 * 60 } }
        );
        const topics = Array.isArray(data?.names) ? data.names : [];
        map[full] = topics;
        map[full.toLowerCase()] = topics;
      } catch {
        /* best effort */
      }
    })
  );

  return map;
}

/**
 * Fetch topics for the configured owners. Tries GraphQL (efficient, 1/owner) with REST fallback.
 * If no token, falls back immediately to REST which still gets topics from list.
 */
export async function fetchTopicsForOwners(
  owners: string[],
  candidates: string[] = []
): Promise<TopicsByRepo> {
  const merged: TopicsByRepo = {};
  for (const owner of owners) {
    let ownerMap: TopicsByRepo = {};
    if (hasGitHubToken()) {
      try {
        ownerMap = await fetchWithGraphQL(owner);
      } catch {
        // fallback
        ownerMap = await fetchWithREST(
          owner,
          candidates.filter((c) => c.toLowerCase().startsWith(owner.toLowerCase() + "/"))
        );
      }
    } else {
      ownerMap = await fetchWithREST(owner, candidates);
    }
    Object.assign(merged, ownerMap);
  }
  return merged;
}
