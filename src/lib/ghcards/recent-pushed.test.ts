import { describe, expect, it } from "vitest";
import {
  generateRecentPushedFooterSvg,
  generateRecentPushedHeaderSvg,
  generateRecentPushedRowSvg,
  generateRecentPushedSvg,
  parseIndex,
  repoAtIndex,
  type GitHubRepo,
} from "./recent-pushed";

const sampleRepos: GitHubRepo[] = [
  {
    name: "shellyxz.sh",
    fork: false,
    private: false,
    pushed_at: new Date().toISOString(),
    language: "Shell",
    stargazers_count: 1,
  },
  {
    name: "devprofile",
    fork: false,
    private: false,
    pushed_at: new Date(Date.now() - 120_000).toISOString(),
    language: "TypeScript",
    stargazers_count: 1,
  },
];

describe("recent-pushed svg helpers", () => {
  it("parses index query values", () => {
    expect(parseIndex("0")).toBe(0);
    expect(parseIndex("2")).toBe(2);
    expect(parseIndex(null)).toBeNull();
    expect(parseIndex("-1")).toBeNull();
    expect(parseIndex("x")).toBeNull();
  });

  it("selects repo by index", () => {
    expect(repoAtIndex(sampleRepos, 0)?.name).toBe("shellyxz.sh");
    expect(repoAtIndex(sampleRepos, 1)?.name).toBe("devprofile");
    expect(repoAtIndex(sampleRepos, 2)).toBeNull();
  });

  it("renders full card with internal row links", () => {
    const svg = generateRecentPushedSvg(sampleRepos, "p10ns11y");
    expect(svg).toContain('href="https://github.com/p10ns11y/shellyxz.sh"');
    expect(svg).toContain("Recently Pushed");
    expect(svg).toContain("Latest");
  });

  it("renders standalone row without anchor tags for README wraps", () => {
    const svg = generateRecentPushedRowSvg(sampleRepos[0], 0);
    expect(svg).toContain("shellyxz.sh");
    expect(svg).not.toContain("<a ");
    expect(svg).toContain('height="48"');
  });

  it("renders stackable header and footer segments", () => {
    const header = generateRecentPushedHeaderSvg("p10ns11y");
    const footer = generateRecentPushedFooterSvg();
    expect(header).toContain("Recently Pushed");
    expect(header).toContain('height="72"');
    expect(footer).toContain("Live from GitHub API");
    expect(footer).toContain('height="48"');
  });
});
