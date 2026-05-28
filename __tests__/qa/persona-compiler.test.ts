/**
 * Unit tests for the Persona Compiler (PR 2).
 *
 * 9 test cases covering:
 * - version + compiledAt contract
 * - goldenExamples extraction (count + high-signal presence + determinism)
 * - ingestDocument shape (canonical ps-profile sections + version tag)
 * - structuredSnapshot minimal fields
 * - toolSystemPrompt contains exact Q6 tone guidance
 * - topAchievements / principles / coreIdentity from sources
 * - full determinism (same sources + fixed time => byte-identical packet except compiledAt)
 * - fromSources injection path (pure, no FS)
 *
 * Uses only Node assert (no new deps). Follows __tests__/qa/types.test.ts exactly.
 *
 * Run:
 *   npx tsx __tests__/qa/persona-compiler.test.ts
 *   # (or via future pnpm test:unit)
 *
 * Also exercised by `pnpm type-check`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  compileProfilePacket,
  compileProfilePacketFromSources,
  type ProfileSources,
} from "@/lib/qa";
import type { ProfilePacket } from "@/lib/qa/types";

// Load MD sources once (pure path for fromSources). Use tiny deterministic cvdata stub
// (real cvdata.json is exercised via the compileProfilePacket loader variant).
const REPO_ROOT = process.cwd();
const load = (p: string) => readFileSync(path.join(REPO_ROOT, p), "utf8");

const psProfileMd = load("src/data/persona/ps-profile-v1.md");
const goldenMd = load("src/data/golden-qa.md");
const casualMd = load("src/data/casual-qa.md");
const top3Md = load("src/data/top-three-achievements.md");

// Minimal stub satisfying all fields read by the pure extraction helpers.
const cvdataStub = {
  name: "Peramanathan Sathyamoorthy",
  one_liner: "Senior Software Engineer with 9+ years.",
  short_bio: "Senior engineer, Master's CS + OR.",
  profile: "Senior Software Engineer with over 9 years building scalable web apps and leading teams.",
  contact: { email: "sathyam.peram@gmail.com", phone: "+46 737 641 917", citizenship: "Swedish" },
  home: { current_location: "Stockholm, Sweden", location: "Stockholm, Sweden" },
  cv_social_links: { github: "https://github.com/p10ns11y", x: "https://x.com/peramanathan" },
  work_experience: [
    { title: "Senior Software Engineer", company: "Oneflow AB, Digital Signature and Contract Management Platform", location: "Stockholm, Sweden", start_date: "January 2023", end_date: "December 2024", duration: "24 months", responsibilities: ["70% type error reduction via TS migration.", "Automated JS→TS saving 200+ hours.", "Unified ACL module."], tools: ["TypeScript", "React"] },
    { title: "Engineering Team Lead", company: "Oneflow AB", location: "Stockholm, Sweden", start_date: "October 2021", end_date: "December 2022", duration: "15 months", responsibilities: ["JSON rich-text editor +60% satisfaction.", "Self-organizing team + Playwright rewrite."], tools: ["JavaScript", "Playwright", "Zod"] },
  ],
  education: [
    { degree: "Master of Science in Computer Science", institution: "Uppsala University, Sweden", years: "2010 - 2016" },
  ],
  languages: { English: "Proficient", Swedish: "Basic" },
  projects: [
    { name: "Grok Dia", description: "Contextual AI extension", technologies: ["Browser Extension", "AI"], impact: "Research velocity" },
    { name: "latex-cv", description: "LaTeX CV automation", technologies: ["LaTeX", "Rust"], impact: "200h/year saved" },
  ],
} as const;

const FIXED_AT = "2026-05-27T12:00:00.000Z";

const sources: ProfileSources = {
  cvdata: cvdataStub as unknown as any, // minimal cast for stub (only fields accessed by extractors; see review #3)
  psProfileMd,
  goldenMd,
  casualMd,
  top3Md,
  version: "v1-2026-05",
  compiledAt: FIXED_AT,
};

/** Build a minimal packet for type smoke (matches PR1 example shape) */
const _examplePacket: ProfilePacket = compileProfilePacketFromSources(sources);

function runPersonaCompilerTests() {
  console.log("Running persona-compiler tests (9 cases)...");

  // Case 1: version + compiledAt
  const p1 = compileProfilePacketFromSources(sources);
  assert.equal(p1.version, "v1-2026-05");
  assert.equal(p1.compiledAt, FIXED_AT);
  assert.ok(p1.compiledAt.includes("2026-05-27"));

  // Case 2: goldenExamples — count 8-12, high-signal stories present, deterministic
  assert.ok(p1.goldenExamples.length >= 8 && p1.goldenExamples.length <= 12, "goldenExamples 8-12");
  const goldenQs = p1.goldenExamples.map((g) => g.q);
  assert.ok(goldenQs.some((q) => /premflow|Dad mode|thesis|Oneflow|Zod/i.test(q)), "contains high-signal golden stories");
  // determinism on extraction
  const p1b = compileProfilePacketFromSources(sources);
  assert.deepEqual(p1.goldenExamples, p1b.goldenExamples);

  // Case 3: ingestDocument shape — contains canonical ps sections + version marker
  assert.ok(p1.ingestDocument.includes("## Core Identity"), "ingest has Core Identity");
  assert.ok(p1.ingestDocument.includes("## Principles & Philosophy"), "ingest has Principles");
  assert.ok(p1.ingestDocument.includes("## Top 3 Standout Achievements"), "ingest has Top 3");
  assert.ok(p1.ingestDocument.includes("## Golden Narrative Examples"), "ingest has Golden Examples");
  assert.ok(p1.ingestDocument.includes("v1-2026-05"), "ingest carries version");
  assert.ok(p1.ingestDocument.includes("compiledAt"), "ingest carries compiledAt (for traceability)");

  // Case 4: structuredSnapshot minimal contract fields
  assert.ok(p1.structuredSnapshot.contact && (p1.structuredSnapshot.contact as unknown as any).email, "snapshot has contact.email"); // shape per types (review #3 hygiene)
  assert.ok(p1.structuredSnapshot.languages, "snapshot has languages");
  assert.ok(Array.isArray(p1.structuredSnapshot.keyTechnologies) && p1.structuredSnapshot.keyTechnologies.length >= 5, "snapshot keyTechnologies");
  assert.ok(p1.structuredSnapshot.education, "snapshot has education");

  // Case 5: toolSystemPrompt carries exact Q6 tone (non-negotiable)
  const tone = "Responses must feel like a real human — warm, professional, with light subtle humor and sparkle infusion where natural. Never heavy or jokey. Sound like a thoughtful, slightly witty colleague who has the user's best interests in mind.";
  assert.ok(p1.toolSystemPrompt.includes(tone), "toolSystemPrompt must embed the exact Q6 tone guidance");

  // Case 6: principles + topAchievements from sources (high signal)
  assert.ok(p1.principles.some((pr) => /premflow \/ EEaaS|Dad-mode|friction.*leverage/i.test(pr)), "principles include thesis + Dad-mode + leverage");
  assert.equal(p1.topAchievements.length, 3, "exactly 3 topAchievements");
  assert.ok(p1.topAchievements[0].title.includes("2016 Master"), "top1 = thesis");
  assert.ok(p1.topAchievements[1].title.includes("Oneflow"), "top2 = Oneflow transformation");
  assert.ok(p1.topAchievements[2].title.includes("Builder Who Turns") || p1.topAchievements[2].title.includes("Personal Friction"), "top3 = friction→leverage");

  // Case 7: coreIdentity is first-person refined narrative (from ps)
  assert.ok(p1.coreIdentity.includes("Peramanathan Sathyamoorthy"), "coreIdentity names the person");
  assert.ok(p1.coreIdentity.includes("Dad mode") || p1.coreIdentity.includes("Stockholm"), "coreIdentity includes Dad-mode / location");

  // Case 8: full determinism (identical packet with fixed time)
  const p2 = compileProfilePacketFromSources(sources);
  // compiledAt same by construction; everything else must match
  assert.equal(p1.version, p2.version);
  assert.deepEqual(p1.principles, p2.principles);
  assert.deepEqual(p1.topAchievements, p2.topAchievements);
  assert.deepEqual(p1.goldenExamples, p2.goldenExamples);
  assert.equal(p1.ingestDocument, p2.ingestDocument);
  assert.equal(p1.toolSystemPrompt, p2.toolSystemPrompt);
  assert.deepEqual(p1.structuredSnapshot, p2.structuredSnapshot);

  // Case 9: loader variant (real FS) produces valid packet of same shape
  const pLoaded = compileProfilePacket("v1-2026-05", FIXED_AT);
  assert.equal(pLoaded.version, "v1-2026-05");
  assert.equal(pLoaded.compiledAt, FIXED_AT);
  assert.ok(pLoaded.goldenExamples.length >= 8);
  assert.ok(pLoaded.toolSystemPrompt.includes(tone));
  // Full determinism: loader + explicit fixed time == fromSources (addresses review #5/#8)
  assert.deepEqual(pLoaded.goldenExamples, p1.goldenExamples);
  assert.equal(pLoaded.ingestDocument, p1.ingestDocument);
  assert.equal(pLoaded.toolSystemPrompt, p1.toolSystemPrompt);
  // Note: loader uses real cvdata.json (fromSources here uses stub); core narrative fields match.

  console.log("✅ persona-compiler tests passed (9 cases: version, golden, ingest, snapshot, tone, principles/achievements, identity, determinism, loader)");
}

// Execute when run directly (matches types.test.ts pattern exactly)
if (process.argv[1]?.endsWith("persona-compiler.test.ts") || process.argv[1]?.endsWith("persona-compiler.test.js")) {
  runPersonaCompilerTests();
}

export { runPersonaCompilerTests };
