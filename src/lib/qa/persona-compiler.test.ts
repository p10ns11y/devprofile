import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  compileProfilePacket,
  compileProfilePacketFromSources,
  type ProfileSources,
  Q6_TONE_GUIDANCE,
} from "./persona-compiler";

const REPO_ROOT = process.cwd();
const load = (p: string) => readFileSync(path.join(REPO_ROOT, p), "utf8");

const cvdataStub = {
  name: "Test Engineer",
  one_liner: "Senior Software Engineer with 9+ years.",
  short_bio: "Senior engineer, Master's CS + OR.",
  profile:
    "Senior Software Engineer with over 9 years building scalable web apps and leading teams.",
  contact: { email: "user@example.com", phone: "+1 555 010 0199", citizenship: "Example" },
  home: { current_location: "Example City, Example Country", location: "Example City" },
  cv_social_links: { github: "https://github.com/example", x: "https://x.com/example" },
  work_experience: [
    {
      title: "Senior Software Engineer",
      company: "Example Platform Co.",
      location: "Example City",
      duration: "24 months",
      responsibilities: ["Reduced type errors via TS migration."],
      tools: ["TypeScript", "React"],
    },
    {
      title: "Engineering Team Lead",
      company: "Example Platform Co.",
      duration: "15 months",
      responsibilities: ["Shipped rich-text editor improvements."],
      tools: ["JavaScript", "Playwright", "Zod"],
    },
  ],
  education: [
    { degree: "Master of Science in Computer Science", institution: "Example University" },
  ],
  languages: { English: "Proficient", Swedish: "Basic" },
  projects: [
    {
      name: "sample-extension",
      description: "Contextual AI extension",
      technologies: ["Browser Extension"],
    },
    { name: "sample-cv-tool", description: "CV automation", technologies: ["LaTeX", "Rust"] },
  ],
};

const FIXED_AT = "2026-05-27T12:00:00.000Z";

const sources: ProfileSources = {
  cvdata: cvdataStub,
  psProfileMd: load("src/data/persona/ps-profile-v1.md"),
  goldenMd: load("src/data/golden-qa.md"),
  casualMd: load("src/data/casual-qa.md"),
  top3Md: load("src/data/top-three-achievements.md"),
  version: "v1-2026-05",
  compiledAt: FIXED_AT,
};

describe("Scenario S6: agent packet for visitor parity", () => {
  it("compiles versioned packet with golden examples and Q6 tone", () => {
    const p1 = compileProfilePacketFromSources(sources);
    expect(p1.version).toBe("v1-2026-05");
    expect(p1.compiledAt).toBe(FIXED_AT);
    expect(p1.goldenExamples.length).toBeGreaterThanOrEqual(8);
    expect(p1.goldenExamples.length).toBeLessThanOrEqual(12);
    expect(p1.toolSystemPrompt).toContain(Q6_TONE_GUIDANCE);
    expect(p1.ingestDocument).toContain("## Core Identity");
    expect(p1.topAchievements).toHaveLength(3);
  });

  it("loader variant matches fromSources shape", () => {
    const fromSources = compileProfilePacketFromSources(sources);
    const loaded = compileProfilePacket("v1-2026-05", FIXED_AT);
    expect(loaded.goldenExamples).toEqual(fromSources.goldenExamples);
    expect(loaded.ingestDocument).toBe(fromSources.ingestDocument);
  });
});
