import { describe, expect, it } from "vitest";
import { selectProjects, selectFromReposList } from "./project-selection";
import { getProjectsPolicy } from "./projects-policy";

describe("project-selection", () => {
  const basePolicy = getProjectsPolicy();

  const mkRepo = (fullName: string, opts: Partial<Record<string, unknown>> = {}) => {
    const [owner, name] = fullName.split("/");
    return {
      full_name: fullName,
      name,
      owner: { login: owner },
      fork: false,
      private: false,
      pushed_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      description: "A project",
      stargazers_count: 3,
      language: "TypeScript",
      topics: [],
      html_url: `https://github.com/${fullName}`,
      ...opts,
    };
  };

  it("gates featured to qualityTopics only", () => {
    const repos = [
      mkRepo("p10ns11y/good", { topics: ["high-quality"], pushed_at: "2025-06-01T00:00:00Z" }),
      mkRepo("p10ns11y/plain", { topics: ["other"], pushed_at: "2025-06-02T00:00:00Z" }),
    ];
    const res = selectProjects(repos, {}, basePolicy);
    expect(res.featuredProjects.map((p) => p.fullName)).toEqual(["p10ns11y/good"]);
    expect(res.recentProjects.map((p) => p.fullName)).toContain("p10ns11y/plain");
  });

  it("applies excludeRepos blocklist", () => {
    const policy = { ...basePolicy, excludeRepos: ["p10ns11y/blocked"] };
    const repos = [
      mkRepo("p10ns11y/good", { topics: ["high-quality"] }),
      mkRepo("p10ns11y/blocked", { topics: ["high-quality"] }),
    ];
    const res = selectProjects(repos, {}, policy);
    expect(res.featuredProjects.find((p) => p.fullName.includes("blocked"))).toBeUndefined();
  });

  it("drops forks and private", () => {
    const repos = [
      mkRepo("p10ns11y/good", { topics: ["high-quality"] }),
      mkRepo("p10ns11y/forked", { fork: true, topics: ["high-quality"] }),
      mkRepo("p10ns11y/priv", { private: true, topics: ["high-quality"] }),
    ];
    const res = selectProjects(repos);
    expect(res.featuredProjects.length).toBe(1);
    expect(res.featuredProjects[0].fullName).toBe("p10ns11y/good");
  });

  it("scores topic + recency + description + stars; featured sorted by score", () => {
    const nowish = new Date(Date.now() - 10 * 86400000).toISOString(); // ~10d
    const old = "2024-01-01T00:00:00Z";
    const repos = [
      mkRepo("p10ns11y/high-old", { topics: ["high-quality"], pushed_at: old, description: "", stargazers_count: 0 }),
      mkRepo("p10ns11y/high-recent", { topics: ["high-quality"], pushed_at: nowish, description: "nice", stargazers_count: 10 }),
      mkRepo("p10ns11y/high-recent2", { topics: ["high-quality"], pushed_at: nowish, description: "nice", stargazers_count: 1 }),
    ];
    const res = selectProjects(repos);
    expect(res.featuredProjects.length).toBeGreaterThanOrEqual(2);
    // highest score first (topic + recency + desc + stars)
    expect(res.featuredProjects[0].fullName).toBe("p10ns11y/high-recent");
  });

  it("dedupes featured out of recentActivity", () => {
    const repos = [
      mkRepo("p10ns11y/feat", { topics: ["high-quality"], pushed_at: "2025-06-01T00:00:00Z" }),
      mkRepo("p10ns11y/recent1", { pushed_at: "2025-06-02T00:00:00Z" }),
      mkRepo("p10ns11y/recent2", { pushed_at: "2025-06-03T00:00:00Z" }),
    ];
    const res = selectProjects(repos);
    const recentNames = res.recentProjects.map((p) => p.fullName);
    expect(recentNames).not.toContain("p10ns11y/feat");
    expect(recentNames).toContain("p10ns11y/recent2");
  });

  it("respects limits", () => {
    const policy = { ...basePolicy, limits: { featured: 1, recentActivity: 2 } };
    const repos: any[] = [];
    for (let i = 0; i < 5; i++) {
      repos.push(mkRepo(`p10ns11y/hq${i}`, { topics: ["high-quality"], pushed_at: `2025-06-0${i}T00:00:00Z` }));
    }
    repos.push(mkRepo("p10ns11y/r1", { pushed_at: "2025-06-10T00:00:00Z" }));
    repos.push(mkRepo("p10ns11y/r2", { pushed_at: "2025-06-11T00:00:00Z" }));
    repos.push(mkRepo("p10ns11y/r3", { pushed_at: "2025-06-12T00:00:00Z" }));
    const res = selectProjects(repos, {}, policy);
    expect(res.featuredProjects.length).toBe(1);
    expect(res.recentProjects.length).toBe(2);
  });

  it("selectFromReposList uses embedded topics", () => {
    const repos = [
      mkRepo("p10ns11y/emb", { topics: ["high-quality"] }),
      mkRepo("p10ns11y/no", { topics: [] }),
    ];
    const res = selectFromReposList(repos);
    expect(res.featuredProjects.length).toBe(1);
    expect(res.featuredProjects[0].fullName).toBe("p10ns11y/emb");
  });
});
