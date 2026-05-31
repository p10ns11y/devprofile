import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProfilePacket } from "./types";

export type { ProfilePacket } from "./types";

export interface ProfileSources {
  cvdata: Record<string, unknown>;
  psProfileMd: string;
  goldenMd: string;
  casualMd: string;
  top3Md: string;
  version: string;
  compiledAt: string;
}

export const Q6_TONE_GUIDANCE =
  "Responses must feel like a real human — warm, professional, with light subtle humor and sparkle infusion where natural. Never heavy or jokey. Sound like a thoughtful, slightly witty colleague who has the user's best interests in mind.";

function extractPrinciples(psProfileMd: string): string[] {
  const section = psProfileMd.match(
    /## Principles & Philosophy[\s\S]*?(?=\n## |\n---|\Z)/
  )?.[0];
  if (!section) return [];
  return section.split("\n").filter((l) => l.startsWith("- **"));
}

function extractTopAchievements(psProfileMd: string): Array<{ title: string; narrative: string }> {
  const section = psProfileMd.match(
    /## Top 3 Standout Achievements[\s\S]*?(?=\n## |\n---|\Z)/
  )?.[0];
  if (!section) return [];
  const blocks = section.split(/\n\*\*(?=\d+\.)/).slice(1);
  return blocks.map((block) => {
    const titleMatch = block.match(/^(\d+\.[^\n*]+)/);
    const title = titleMatch ? titleMatch[1].trim() : "Achievement";
    const narrative = block.replace(/^\d+\.[^\n]+\n?/, "").trim();
    return { title, narrative };
  });
}

function extractCoreIdentity(psProfileMd: string): string {
  const section = psProfileMd.match(/## Core Identity[\s\S]*?(?=\n## |\n---|\Z)/)?.[0];
  if (!section) return "";
  return section
    .replace(/## Core Identity\n?/, "")
    .trim()
    .split("\n\n")
    .slice(0, 3)
    .join("\n\n");
}

/** Parse **Q: ...** / **A:** blocks from golden + casual markdown. */
export function extractGoldenExamples(goldenMd: string, casualMd: string): Array<{ q: string; a: string }> {
  const combined = `${goldenMd}\n\n${casualMd}`;
  const examples: Array<{ q: string; a: string }> = [];
  const re = /\*\*Q:\s*([^*]+?)\*\*\s*\n+\*\*A:\*\*\s*([\s\S]*?)(?=\n###|\n\*\*Q:|\n---|\Z)/gi;
  let match = re.exec(combined);
  while (match !== null) {
    const q = match[1].trim();
    const a = match[2].trim();
    if (q && a.length > 20) examples.push({ q, a });
    match = re.exec(combined);
  }
  return examples.slice(0, 12);
}

function buildStructuredSnapshot(cvdata: Record<string, unknown>): ProfilePacket["structuredSnapshot"] {
  const contact = (cvdata.contact as Record<string, unknown>) || {};
  const work = (cvdata.work_experience as Array<{ tools?: string[] }>) || [];
  const tech = new Set<string>();
  for (const w of work) {
    for (const t of w.tools || []) tech.add(t);
  }
  const projects = (cvdata.projects as Array<{ technologies?: string[] }>) || [];
  for (const p of projects) {
    for (const t of p.technologies || []) tech.add(t);
  }
  return {
    contact,
    education: cvdata.education,
    languages: cvdata.languages,
    keyTechnologies: [...tech],
  };
}

function buildExperienceHighlights(cvdata: Record<string, unknown>): ProfilePacket["experienceHighlights"] {
  const work = (cvdata.work_experience as Array<Record<string, unknown>>) || [];
  return work.slice(0, 4).map((w) => ({
    company: String(w.company || ""),
    title: String(w.title || ""),
    duration: String(w.duration || ""),
    impacts: (w.responsibilities as string[]) || [],
  }));
}

function buildSignatureProjects(cvdata: Record<string, unknown>): ProfilePacket["signatureProjects"] {
  const projects = (cvdata.projects as Array<Record<string, unknown>>) || [];
  return projects.map((p) => ({
    name: String(p.name || ""),
    description: String(p.description || ""),
    impact: p.impact ? String(p.impact) : undefined,
    tech: (p.technologies as string[]) || [],
  }));
}

function buildIngestDocument(sources: ProfileSources, packet: Partial<ProfilePacket>): string {
  const lines = [
    `# Persona Ingest — ${sources.version}`,
    `compiledAt: ${sources.compiledAt}`,
    "",
    "## Core Identity",
    packet.coreIdentity || "",
    "",
    "## Principles & Philosophy",
    ...(packet.principles || []).map((p) => `- ${p}`),
    "",
    "## Top 3 Standout Achievements",
    ...(packet.topAchievements || []).map((a) => `**${a.title}**\n${a.narrative}`),
    "",
    "## Golden Narrative Examples",
    ...(packet.goldenExamples || []).map((g) => `**Q:** ${g.q}\n**A:** ${g.a}`),
    "",
    "---",
    "",
    sources.psProfileMd,
  ];
  return lines.join("\n");
}

function buildToolSystemPrompt(): string {
  return [
    "You are Peramanathan Sathyamoorthy answering in first person about your professional background.",
    "Use the provided Collections-backed tools for every factual detail.",
    Q6_TONE_GUIDANCE,
  ].join("\n\n");
}

export function compileProfilePacketFromSources(sources: ProfileSources): ProfilePacket {
  const goldenExamples = extractGoldenExamples(sources.goldenMd, sources.casualMd);
  const principles = extractPrinciples(sources.psProfileMd);
  const topAchievements = extractTopAchievements(sources.psProfileMd);
  const coreIdentity = extractCoreIdentity(sources.psProfileMd);

  const partial: Partial<ProfilePacket> = {
    version: sources.version,
    compiledAt: sources.compiledAt,
    coreIdentity,
    principles,
    topAchievements,
    experienceHighlights: buildExperienceHighlights(sources.cvdata),
    signatureProjects: buildSignatureProjects(sources.cvdata),
    goldenExamples,
    structuredSnapshot: buildStructuredSnapshot(sources.cvdata),
    toolSystemPrompt: buildToolSystemPrompt(),
  };

  return {
    ...partial,
    version: sources.version,
    compiledAt: sources.compiledAt,
    coreIdentity,
    principles,
    topAchievements,
    experienceHighlights: partial.experienceHighlights || [],
    signatureProjects: partial.signatureProjects || [],
    goldenExamples,
    structuredSnapshot: partial.structuredSnapshot || {},
    ingestDocument: buildIngestDocument(sources, partial),
    toolSystemPrompt: buildToolSystemPrompt(),
  };
}

export function compileProfilePacket(
  version = "v1-2026-05",
  compiledAt = new Date().toISOString()
): ProfilePacket {
  const root = process.cwd();
  const load = (p: string) => readFileSync(join(root, p), "utf8");
  const cvdata = JSON.parse(load("src/data/cvdata.json")) as Record<string, unknown>;
  return compileProfilePacketFromSources({
    cvdata,
    psProfileMd: load("src/data/persona/ps-profile-v1.md"),
    goldenMd: load("src/data/golden-qa.md"),
    casualMd: load("src/data/casual-qa.md"),
    top3Md: load("src/data/top-three-achievements.md"),
    version,
    compiledAt,
  });
}

/** Legacy array shape used by persona-reactor cold load. */
export function compileProfilePacketFromRawSources(
  rawSources: Array<{ name: string; content: string }>
): ProfilePacket {
  const byName = Object.fromEntries(rawSources.map((s) => [s.name, s.content]));
  let cvdata: Record<string, unknown> = {};
  try {
    cvdata = JSON.parse(byName["cvdata.json"] || "{}") as Record<string, unknown>;
  } catch {
    cvdata = {};
  }
  return compileProfilePacketFromSources({
    cvdata,
    psProfileMd: byName["ps-profile-v1.md"] || "",
    goldenMd: byName["golden-qa.md"] || "",
    casualMd: byName["casual-qa.md"] || "",
    top3Md: byName["top-three-achievements.md"] || "",
    version: "v1-2026-05",
    compiledAt: new Date().toISOString(),
  });
}
