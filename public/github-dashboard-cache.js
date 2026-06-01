/**
 * Shared GitHub dashboard cache (IndexedDB) — canonical source.
 * Copied to public/github-dashboard-cache.js via scripts/sync-github-dashboard-cache.mjs
 * for static HTML + service worker (/sw.js).
 */

export const DB_NAME = "devprofile-github-dashboard";
export const DB_VERSION = 1;
export const STORE = "snapshots";
/**
 * Minimum time between network refreshes (~4× per day).
 * IndexedDB + CDN may serve data longer; manual Refresh always bypasses.
 */
export const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
/** @deprecated Use REFRESH_INTERVAL_MS */
export const STALE_MS = REFRESH_INTERVAL_MS;
export const SYNC_TAG = "github-dashboard-sync";
export const BACKGROUND_FETCH_ID = "github-dashboard-fetch";
export const DEFAULT_USERNAME = "p10ns11y";

export const GITHUB_API_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

/** Keep in sync with src/lib/github/creative-projects.ts */
export const CREATIVE_PROJECTS_BY_OWNER = Object.freeze({
  p10ns11y: [
    "elomaxz",
    "arch-machine",
    "thepulimaangani",
    "devprofile",
    "selfie-sign-in-flow-using-v0-xAI",
    "sorkalam-extension",
  ],
  thecuriousts: ["premflow"],
});

export function getCreativeProjectSlugs(projectsByOwner = CREATIVE_PROJECTS_BY_OWNER) {
  return Object.entries(projectsByOwner).flatMap(([owner, repos]) =>
    repos.map((repo) => `${owner}/${repo}`)
  );
}

function snapshotKey(username) {
  return `dashboard:${username}`;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

export async function getSnapshot(username) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(snapshotKey(username));
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function putSnapshot(username, snapshot) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(snapshot, snapshotKey(username));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function formatSyncTime(fetchedAt) {
  return new Date(fetchedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isStale(fetchedAt, maxAgeMs = STALE_MS) {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt > maxAgeMs;
}

/** Same-origin Vercel proxy (token + CDN). Returns null on file:// or external hosts. */
export function getDashboardApiUrl(username) {
  const origin =
    typeof self !== "undefined" && self.location?.origin
      ? self.location.origin
      : typeof window !== "undefined"
        ? window.location?.origin
        : "";
  if (!origin || origin === "null" || origin.startsWith("file:")) {
    return null;
  }
  const params = new URLSearchParams({ username });
  return `${origin}/api/github/dashboard?${params}`;
}

async function fetchCreativeProject(fullName, reposList, signal) {
  const fromList = reposList.find(
    (r) => (r.full_name || "").toLowerCase() === fullName.toLowerCase()
  );

  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: GITHUB_API_HEADERS,
      signal,
    });
    if (res.ok) {
      const repo = await res.json();
      return {
        fullName,
        repo,
        topics: Array.isArray(repo.topics) ? repo.topics : [],
      };
    }
  } catch {
    /* fall through */
  }

  if (fromList) {
    return {
      fullName,
      repo: fromList,
      topics: Array.isArray(fromList.topics) ? fromList.topics : [],
    };
  }

  return { fullName, repo: null, topics: [] };
}

/**
 * Network fetch via /api/github/dashboard when on deployed origin (recommended),
 * else direct GitHub API (local dev / rate-limited).
 */
export async function fetchGitHubSnapshot(username, options = {}) {
  const { signal, projectsByOwner = CREATIVE_PROJECTS_BY_OWNER } = options;

  const apiUrl = getDashboardApiUrl(username);
  if (apiUrl) {
    const res = await fetch(apiUrl, { signal, credentials: "same-origin" });
    if (res.ok) {
      const snapshot = await res.json();
      return {
        username: snapshot.username ?? username,
        user: snapshot.user,
        repos: snapshot.repos ?? [],
        creativeProjects: snapshot.creativeProjects ?? [],
        fetchedAt: snapshot.fetchedAt ?? Date.now(),
      };
    }
    if (res.status !== 502 && res.status !== 503) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Dashboard API error (${res.status})`);
    }
    /* 502/503: fall through to direct GitHub for resilience */
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, {
      signal,
      headers: GITHUB_API_HEADERS,
    }),
    fetch(
      `https://api.github.com/users/${username}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
      { signal, headers: GITHUB_API_HEADERS }
    ),
  ]);

  if (!userRes.ok || !reposRes.ok) {
    throw new Error("GitHub API error or rate limit exceeded");
  }

  const user = await userRes.json();
  const repos = await reposRes.json();

  const creativeProjects = await Promise.all(
    getCreativeProjectSlugs(projectsByOwner).map((fullName) =>
      fetchCreativeProject(fullName, repos, signal)
    )
  );

  return {
    username,
    user,
    repos,
    creativeProjects,
    fetchedAt: Date.now(),
  };
}

/**
 * Stale-while-revalidate: optional onCached callback, then network if stale/forced.
 */
export async function loadDashboardData(username, options = {}) {
  const { forceRefresh = false, signal, onCached } = options;

  const cached = await getSnapshot(username);
  if (cached && onCached) {
    onCached(cached);
  }

  if (cached && !forceRefresh && !isStale(cached.fetchedAt)) {
    return { ...cached, source: "cache" };
  }

  try {
    const fresh = await fetchGitHubSnapshot(username, { signal });
    await putSnapshot(username, fresh);
    return { ...fresh, source: "network" };
  } catch (err) {
    if (cached) {
      return {
        ...cached,
        source: "cache-fallback",
        error: err?.message || "Failed to load data",
      };
    }
    throw err;
  }
}

/** Service worker / background sync — skips network if IndexedDB snapshot is still fresh */
export async function refreshDashboardInBackground(username = DEFAULT_USERNAME) {
  const cached = await getSnapshot(username);
  if (cached && !isStale(cached.fetchedAt)) {
    return cached;
  }

  const snapshot = await fetchGitHubSnapshot(username);
  await putSnapshot(username, snapshot);

  if (typeof self !== "undefined" && self.clients?.matchAll) {
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    for (const client of clients) {
      client.postMessage({
        type: "GITHUB_DASHBOARD_UPDATED",
        username,
        fetchedAt: snapshot.fetchedAt,
      });
    }
  }

  return snapshot;
}

/**
 * Build snapshot from a completed Background Fetch registration.
 */
export async function applyBackgroundFetchToSnapshot(registration, username = DEFAULT_USERNAME) {
  const records = await registration.matchAll();
  let user = null;
  let repos = null;
  const repoByFullName = new Map();

  for (const record of records) {
    if (!record.responseReady) continue;
    const response = await record.responseReady;
    if (!response.ok) continue;

    const url = record.request.url;

    if (url.includes("/api/github/dashboard")) {
      const snapshot = await response.json();
      await putSnapshot(username, snapshot);
      if (typeof self !== "undefined" && self.clients?.matchAll) {
        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        for (const client of clients) {
          client.postMessage({
            type: "GITHUB_DASHBOARD_UPDATED",
            username,
            fetchedAt: snapshot.fetchedAt,
          });
        }
      }
      return snapshot;
    }

    const data = await response.json();

    if (url.includes(`/users/${username}`) && !url.includes("/repos")) {
      user = data;
    } else if (url.includes(`/users/${username}/repos`)) {
      repos = data;
    } else if (url.includes("/repos/")) {
      const match = url.match(/\/repos\/([^/]+\/[^/?]+)/);
      if (match) {
        repoByFullName.set(match[1].toLowerCase(), data);
      }
    }
  }

  if (!user || !repos) {
    return refreshDashboardInBackground(username);
  }

  const creativeProjects = getCreativeProjectSlugs().map((fullName) => {
    const repo =
      repoByFullName.get(fullName.toLowerCase()) ||
      repos.find((r) => (r.full_name || "").toLowerCase() === fullName.toLowerCase());
    return {
      fullName,
      repo: repo || null,
      topics: Array.isArray(repo?.topics) ? repo.topics : [],
    };
  });

  const snapshot = {
    username,
    user,
    repos,
    creativeProjects,
    fetchedAt: Date.now(),
  };

  await putSnapshot(username, snapshot);

  if (typeof self !== "undefined" && self.clients?.matchAll) {
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    for (const client of clients) {
      client.postMessage({
        type: "GITHUB_DASHBOARD_UPDATED",
        username,
        fetchedAt: snapshot.fetchedAt,
      });
    }
  }

  return snapshot;
}

/**
 * Register periodic background sync, one-shot sync, and Background Fetch when supported.
 */
export async function registerDashboardBackgroundSync(username = DEFAULT_USERNAME) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return { periodic: false, backgroundFetch: false, sync: false };
  }

  let reg = await navigator.serviceWorker.getRegistration("/");
  if (!reg) {
    try {
      reg = await navigator.serviceWorker.register("/sw.js", { type: "module" });
    } catch {
      return { periodic: false, backgroundFetch: false, sync: false };
    }
  }

  const result = { periodic: false, backgroundFetch: false, sync: false };
  const cached = await getSnapshot(username);
  const needsRefresh = !cached || isStale(cached.fetchedAt);

  if ("periodicSync" in reg) {
    try {
      const perm =
        typeof PeriodicSyncManager !== "undefined"
          ? await navigator.permissions.query({
              name: "periodic-background-sync",
            })
          : { state: "prompt" };
      if (perm.state === "granted" || perm.state === "prompt") {
        await reg.periodicSync.register(SYNC_TAG, {
          minInterval: REFRESH_INTERVAL_MS,
        });
        result.periodic = true;
      }
    } catch {
      /* unsupported */
    }
  }

  if ("sync" in reg && needsRefresh) {
    try {
      await reg.sync.register(SYNC_TAG);
      result.sync = true;
    } catch {
      /* unsupported */
    }
  }

  if ("backgroundFetch" in reg && needsRefresh) {
    try {
      const apiUrl = getDashboardApiUrl(username);
      const requests = apiUrl
        ? [new Request(apiUrl, { credentials: "same-origin" })]
        : [
            new Request(`https://api.github.com/users/${username}`, {
              headers: GITHUB_API_HEADERS,
            }),
            new Request(
              `https://api.github.com/users/${username}/repos?affiliation=owner&per_page=100&sort=pushed&direction=desc`,
              { headers: GITHUB_API_HEADERS }
            ),
            ...getCreativeProjectSlugs().map(
              (slug) =>
                new Request(`https://api.github.com/repos/${slug}`, {
                  headers: GITHUB_API_HEADERS,
                })
            ),
          ];

      await reg.backgroundFetch.fetch(BACKGROUND_FETCH_ID, requests, {
        title: "Syncing GitHub dashboard",
        icons: [{ sizes: [96, 96], src: "/favicon.ico", type: "image/png" }],
      });
      result.backgroundFetch = true;
    } catch {
      /* already registered or unsupported */
    }
  }

  return result;
}

export function listenForDashboardUpdates(onUpdate) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return () => {};
  }

  const handler = (event) => {
    const data = event.data;
    if (data?.type === "GITHUB_DASHBOARD_UPDATED") {
      onUpdate(data);
    }
  };

  navigator.serviceWorker.addEventListener("message", handler);
  return () => navigator.serviceWorker.removeEventListener("message", handler);
}
