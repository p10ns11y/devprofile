import { describe, expect, it } from "vitest";
import {
  renderFooterSegment,
  renderFullCard,
  renderHeaderSegment,
  renderRowSegment,
} from "./embed";
import { parseIndex, parseLimit, parsePart } from "./params";
import { recentPushedCard, type GitHubRepo } from "./cards/recent-pushed";
import { recentPrsCard, type GitHubPullRequest } from "./cards/recent-prs";
import { generateReadmeHtml } from "./readme-html";
import { getGhcardsCard, listGhcards } from "./registry";

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

const samplePrs: GitHubPullRequest[] = [
  {
    title: "Add stackable ghcard rows",
    number: 60,
    updated_at: new Date().toISOString(),
    state: "open",
    repository_url: "https://api.github.com/repos/p10ns11y/devprofile",
    html_url: "https://github.com/p10ns11y/devprofile/pull/60",
    pull_request: { merged_at: null },
  },
];

describe("ghcards embed reactor", () => {
  it("registers list cards", () => {
    expect(listGhcards().map((card) => card.id)).toEqual(["recent-pushed", "recent-prs"]);
    expect(getGhcardsCard("missing")).toBeNull();
  });

  it("parses query params", () => {
    expect(parseIndex("0")).toBe(0);
    expect(parseIndex(null)).toBeNull();
    expect(parseLimit(null, 5, 8)).toBe(5);
    expect(parseLimit("99", 5, 8)).toBe(8);
    expect(parsePart("row")).toBe("row");
    expect(parsePart("nope")).toBeNull();
  });

  it("renders recent-pushed full and row segments", () => {
    const full = renderFullCard(recentPushedCard, sampleRepos, "p10ns11y");
    expect(full).toContain('href="https://github.com/p10ns11y/shellyxz.sh"');
    expect(full).toContain("Recently Pushed");

    const row = renderRowSegment(recentPushedCard, sampleRepos[0], 0);
    expect(row).toContain("shellyxz.sh");
    expect(row).not.toContain("<a ");
    expect(row).toContain('height="48"');
  });

  it("renders stackable header and footer segments", () => {
    const header = renderHeaderSegment(recentPushedCard, "p10ns11y");
    const footer = renderFooterSegment(recentPushedCard);
    expect(header).toContain("Recently Pushed");
    expect(header).toContain('height="72"');
    expect(footer).toContain("Live from GitHub API");
    expect(footer).toContain('height="48"');
  });

  it("renders recent-prs row segment", () => {
    const row = renderRowSegment(recentPrsCard, samplePrs[0], 0);
    expect(row).toContain("Add stackable ghcard rows");
    expect(row).not.toContain("<a ");
    expect(row).toContain('height="52"');
  });

  it("generates README HTML with unified embed and go routes", () => {
    const html = generateReadmeHtml({
      baseUrl: "https://peramanathan-sathyamoorthy-cv.vercel.app",
      cardId: "recent-pushed",
      username: "p10ns11y",
      limit: 4,
    });

    expect(html).toContain("/api/ghcards/embed?card=recent-pushed");
    expect(html).toContain("/api/ghcards/go?card=recent-pushed");
    expect(html).toContain("part=header");
    expect(html).toContain("part=row");
    expect(html).toContain("index=0");
    expect(html).toContain("index=3");
    expect(html).toContain("part=footer");
  });

  it("generates README HTML for recent-prs", () => {
    const html = generateReadmeHtml({
      baseUrl: "https://peramanathan-sathyamoorthy-cv.vercel.app",
      cardId: "recent-prs",
      username: "p10ns11y",
      limit: 5,
    });

    expect(html).toContain("card=recent-prs");
    expect(html).toContain('width="640"');
    expect(html).toContain('height="52"');
    expect(html).toContain("index=4");
  });
});
