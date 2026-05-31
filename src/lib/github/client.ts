const GITHUB_API_VERSION = "2022-11-28";

export function githubApiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function hasGitHubToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}

export async function fetchGitHubJson<T>(
  url: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...githubApiHeaders(),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 403 && detail.includes("rate limit")) {
      throw new Error("GitHub API rate limit exceeded");
    }
    throw new Error(`GitHub API error (${res.status})`);
  }

  return res.json() as Promise<T>;
}
