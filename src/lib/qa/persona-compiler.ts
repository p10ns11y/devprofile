/**
 * Persona Compiler (PR 2)
 *
 * Pure, testable function(s) that turn the four raw sources into a versioned
 * ProfilePacket. No network, no Collections, no side effects beyond deterministic
 * FS reads for the canonical inputs (or injected sources for tests).
 *
 * Matches the exact ProfilePacket contract from PR1 types + design:
 * - version, compiledAt
 * - coreIdentity, principles, topAchievements, experienceHighlights, signatureProjects
 * - goldenExamples (tone anchors)
 * - structuredSnapshot (minimal factual subset)
 * - ingestDocument (MD ready for Collections, based on ps-profile-v1.md structure)
 * - toolSystemPrompt (includes the exact Q6 human-tone guidance)
 *
 * Deterministic: same sources + fixed compiledAt => identical packet (modulo
 * compiledAt when using the loader variant).
 *
 * Source format contract (for extractors): ps-profile-v1.md (## sections + bullets),
 * golden-qa.md + casual-qa.md + top-three ( **N?. Q: / **A: pairs), cvdata.json (known shape).
 * See validatePacketShape + parse* helpers. Minor drift surfaces in dev/test (review #2/#11).
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (PR2 + packet shape)
 * @see src/lib/qa/types.ts
 */

import cvdata from "@/data/cvdata.json";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { ProfilePacket } from "./types";

// -----------------------------------------------------------------------------
// Loader (thin FS boundary for convenience; pure once sources are in memory)
// -----------------------------------------------------------------------------

const REPO_ROOT = process.cwd();

function loadText(relPath: string): string {
  const full = path.join(REPO_ROOT, relPath);
  return readFileSync(full, "utf8");
}

/**
 * Convenience loader. Uses real sources on disk (readFileSync).
 * Non-deterministic by default (wall-clock compiledAt + CWD for paths).
 * Prefer compileProfilePacketFromSources (pure, injectable, fixed time) for production
 * paths, tests, and determinism guarantees (see review #5). Loader is for dev/internal use.
 * Pass explicit compiledAt for reproducible packets from this entrypoint.
 */
export function compileProfilePacket(
  version: ProfilePacket["version"] = "v1-2026-05",
  compiledAt: string = new Date().toISOString()
): ProfilePacket {
  const psProfileMd = loadText("data/persona/ps-profile-v1.md");
  const goldenMd = loadText("src/data/golden-qa.md");
  const casualMd = loadText("src/data/casual-qa.md");
  const top3Md = loadText("src/data/top-three-achievements.md");

  return compileProfilePacketFromSources({
    cvdata,
    psProfileMd,
    goldenMd,
    casualMd,
    top3Md,
    version,
    compiledAt,
  });
}

// -----------------------------------------------------------------------------
// Pure core (fully testable, injectable sources, no FS)
// -----------------------------------------------------------------------------

export interface ProfileSources {
  cvdata: typeof cvdata;
  psProfileMd: string;
  goldenMd: string;
  casualMd: string;
  top3Md: string;
  version?: ProfilePacket["version"];
  compiledAt?: string;
}

export function compileProfilePacketFromSources(
  sources: ProfileSources
): ProfilePacket {
  const {
    cvdata: cv,
    psProfileMd: ps,
    goldenMd,
    casualMd,
    top3Md,
    version = "v1-2026-05",
    compiledAt = "2026-05-27T12:00:00.000Z", // stable default for determinism in tests
  } = sources;

  // --- Narrative extraction (stable, from ps-profile-v1.md canonical) ---
  const coreIdentity = extractCoreIdentity(ps, cv);
  const principles = extractPrinciples(ps);
  const topAchievements = extractTopAchievements(top3Md, ps);
  const experienceHighlights = extractExperienceHighlights(cv, ps);
  const signatureProjects = extractSignatureProjects(cv, ps);

  // --- Golden tone anchors (8-15 high-signal pairs; deterministic order) ---
  const goldenExamples = extractGoldenExamples(goldenMd, casualMd, ps);

  // --- Minimal factual snapshot (grounding only) ---
  const structuredSnapshot = buildStructuredSnapshot(cv);

  // --- Ingest document: the canonical ps-profile-v1.md is the validated ingest shape ---
  // (per design + ps header: ready for Collections with versioned sections)
  const ingestDocument = ps.trim() + "\n\n<!-- version: " + version + " compiledAt: " + compiledAt + " -->\n";

  // --- Tool system prompt (injected into reactor; carries Q6 tone exactly) ---
  const toolSystemPrompt = buildToolSystemPrompt(
    coreIdentity,
    principles,
    goldenExamples,
    topAchievements
  );

  const packet: ProfilePacket = {
    version,
    compiledAt,
    coreIdentity,
    principles,
    topAchievements,
    experienceHighlights,
    signatureProjects,
    goldenExamples,
    structuredSnapshot,
    ingestDocument,
    toolSystemPrompt,
  };

  // Post-assembly validation (review #2): defensive check against source format contract.
  // Guarantees minima; throws with guidance only in test/dev (preserves prod purity).
  validatePacketShape(packet);

  // Freeze for purity / accidental mutation protection (deep).
  // Intentional: this is the *final* step of the pure builder (review #4).
  // It mutates only the freshly-constructed local graph before return (no caller-visible
  // side effects beyond the returned value). Standard deep-freeze pattern for immutable
  // contract. A non-mutating clone+freeze would add unnecessary allocations for this
  // tiny packet with zero observable benefit. Documented here for purity hygiene.
  return deepFreeze(packet);
}

// -----------------------------------------------------------------------------
// Extraction helpers (pure, deterministic string/JSON transforms)
// -----------------------------------------------------------------------------

function extractCoreIdentity(ps: string, cv: typeof cvdata): string {
  // Prefer the refined first-person Core Identity block from ps-profile-v1.md
  const section = extractMarkdownSection(ps, "Core Identity");
  if (section) {
    // Clean and enrich lightly with cv one_liner for completeness (no duplication)
    const oneLiner = cv.one_liner || cv.short_bio || "";
    return section.replace(/\s+/g, " ").trim() + (oneLiner ? ` ${oneLiner}` : "");
  }
  // Fallback (should not happen with canonical sources)
  return `${cv.profile} ${cv.home?.current_location || "Stockholm, Sweden"}. ${cv.one_liner}`;
}

function extractPrinciples(ps: string): string[] {
  const section = extractMarkdownSection(ps, "Principles & Philosophy (High-Signal Core)");
  if (!section) return [];
  // Bullet lines starting with -
  return section
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim())
    .filter(Boolean)
    .slice(0, 6); // cap at 6; canonical has 5
}

function extractTopAchievements(top3: string, ps: string): Array<{ title: string; narrative: string }> {
  // Prefer the dedicated top-three-achievements.md (short, canonical)
  const items: Array<{ title: string; narrative: string }> = [];
  // Match **1. Title** \n narrative until **2. or end
  const re = /\*\*(\d+)\.\s+([^*]+?)\*\*\s*([\s\S]*?)(?=\n\*\*\d+\.|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(top3)) !== null) {
    const title = m[2].trim();
    const narrative = m[3].trim().replace(/\s+/g, " ");
    if (title && narrative) items.push({ title, narrative });
  }
  if (items.length >= 3) return items.slice(0, 3);

  // Fallback parse from ps "Top 3 Standout Achievements"
  const psSection = extractMarkdownSection(ps, "Top 3 Standout Achievements");
  if (psSection) {
    // Simpler split on **1. etc inside ps
    const psItems = psSection
      .split(/\n\*\*\d+\.\s+/)
      .slice(1)
      .map((chunk) => {
        const [titleLine, ...rest] = chunk.split("\n");
        return {
          title: titleLine.replace(/\*\*/g, "").trim(),
          narrative: rest.join(" ").trim().replace(/\s+/g, " "),
        };
      })
      .filter((x) => x.title && x.narrative);
    if (psItems.length) return psItems.slice(0, 3);
  }
  return items;
}

function extractExperienceHighlights(cv: typeof cvdata, _ps: string): ProfilePacket["experienceHighlights"] {
  // Use the structured cvdata (most accurate durations/impacts); keep recent + shape
  return cv.work_experience.slice(0, 3).map((exp) => ({
    company: exp.company.split(",")[0].trim(), // "Oneflow AB"
    title: exp.title,
    duration: exp.duration,
    impacts: exp.responsibilities.map((r) => r.trim()),
  }));
}

function extractSignatureProjects(cv: typeof cvdata, ps: string): ProfilePacket["signatureProjects"] {
  const fromPs = parseSignatureProjectsFromPs(ps);
  // Enrich / fallback with high-signal ones from cvdata.projects (Grok Dia, latex-cv, react-intl contrib)
  const fromCv = (cv.projects || [])
    .filter((p) =>
      ["Grok Dia", "latex-cv", "babel-plugin-react-intl-messages-generator"].some((k) =>
        p.name.toLowerCase().includes(k.toLowerCase())
      )
    )
    .map((p) => ({
      name: p.name,
      description: p.description,
      impact: p.impact,
      tech: p.technologies || [],
    }));

  // Stable merge, dedup by name, prefer ps narrative (richer for premflow/arch etc)
  const merged = [...fromPs];
  for (const c of fromCv) {
    if (!merged.some((m) => m.name.toLowerCase() === c.name.toLowerCase())) {
      merged.push(c);
    }
  }
  // Always ensure premflow + arch-machine + Grok Dia + Zod (from persona stories).
  // Defensive completeness (review #7): these live in ps-profile narrative but may be missed
  // by section parsers on minor MD drift. Sync with ps-profile-v1.md on evolution. Objects match exact shape.
  const mustHave: ProfilePacket["signatureProjects"] = [
    { name: "premflow", description: "<300-line C CLI for notes/tasks/pomodoros/daily review. Instant, zero deps, muscle memory. Protects deep work in Dad mode.", tech: ["C"] },
    { name: "arch-machine", description: "One-command hardened Arch Linux bootstrap with ROCm/K8s/security audits for ML/AI workstations. Quiet infrastructure.", tech: ["Arch Linux", "Bash", "ROCm"] },
    { name: "Grok Dia", description: "Browser extension for instant contextual Grok queries on any page with full selection context. Research velocity.", tech: ["Browser Extension", "AI"] },
    { name: "Zod PR #1702", description: "Fixed nullish chaining ordering bug affecting thousands of schemas. Personal friction → public leverage.", tech: ["TypeScript", "Zod"] },
  ];
  for (const m of mustHave) {
    if (!merged.some((x) => x.name.toLowerCase().includes(m.name.toLowerCase()))) {
      merged.push(m);  // now correctly typed, no cast
    }
  }
  return merged.slice(0, 6);
}

// -----------------------------------------------------------------------------
// Post-extraction validation (addresses review #2 brittleness)
// Pure, defensive: enforces design minima on the assembled packet.
// Throws with actionable message only in non-prod (test/dev) to surface format drift early.
// In prod: silent best-effort (preserves purity + no new failure modes for reactor).
// Callers (tests + future reactor) get clear diagnostics if canonical sources ever change.
// -----------------------------------------------------------------------------
function validatePacketShape(p: ProfilePacket): void {
  const issues: string[] = [];
  if (p.goldenExamples.length < 8) issues.push(`goldenExamples.length=${p.goldenExamples.length} < 8 (expected 8-12 from golden+casual+ps)`);
  if (p.topAchievements.length !== 3) issues.push(`topAchievements.length=${p.topAchievements.length} !== 3`);
  if (p.principles.length < 3) issues.push(`principles.length=${p.principles.length} < 3`);
  if (!p.toolSystemPrompt.includes("Responses must feel like a real human")) issues.push("toolSystemPrompt missing exact Q6 tone sentence");
  if (p.ingestDocument.length < 2000) issues.push(`ingestDocument too short (${p.ingestDocument.length} chars; expected full ps-profile)`);
  if (issues.length > 0) {
    const msg = `Persona compiler produced degraded packet (source format contract drift?):\n- ${issues.join("\n- ")}\n` +
      "Sources: data/persona/ps-profile-v1.md + src/data/{golden-qa,casual-qa,top-three-achievements}.md must match documented structure.\n" +
      "See extract* helpers and parseQAPairs for heading/Q-A expectations.";
    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      throw new Error(msg);
    }
    // Prod: best-effort (no throw); downstream (PR4 golden fallback, PR6 reactor) can observe via logs if added later.
  }
}

function parseSignatureProjectsFromPs(ps: string): ProfilePacket["signatureProjects"] {
  const section = extractMarkdownSection(ps, "Signature Projects & Contributions");
  if (!section) return [];
  const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);
  const out: ProfilePacket["signatureProjects"] = [];
  for (const line of lines) {
    if (line.startsWith("- **")) {
      const nameMatch = line.match(/\*\*([^*]+)\*\*/);
      const name = nameMatch ? nameMatch[1].trim() : "";
      const rest = line.replace(/^- \*\*[^*]+\*\*:\s*/, "").trim();
      if (name) {
        out.push({
          name,
          description: rest,
          tech: [], // enriched later
        });
      }
    }
  }
  return out;
}

function extractGoldenExamples(golden: string, casual: string, ps: string): Array<{ q: string; a: string }> {
  const fromGolden = parseQAPairs(golden, 20);
  const fromCasual = parseQAPairs(casual, 10);
  // Also parse the curated ones embedded in ps "Golden Narrative Examples" (high-signal per design)
  const fromPs = parseQAPairs(ps, 8);

  // Stable priority: ps-curated first (tone anchors the user refined), then top from golden, then casual
  const seen = new Set<string>();
  const result: Array<{ q: string; a: string }> = [];
  const pushUnique = (pair: { q: string; a: string }) => {
    const key = pair.q.toLowerCase().slice(0, 60);
    if (!seen.has(key) && pair.q.length > 8 && pair.a.length > 20) {
      seen.add(key);
      result.push({ q: pair.q, a: pair.a });
    }
  };

  fromPs.forEach(pushUnique);
  fromGolden.forEach(pushUnique);
  fromCasual.forEach(pushUnique);

  // Exactly 8-12 as per design contract (cap for token efficiency)
  return result.slice(0, 12);
}

function parseQAPairs(md: string, max: number): Array<{ q: string; a: string }> {
  const pairs: Array<{ q: string; a: string }> = [];
  // Accepts golden-qa.md + ps-embedded "**Q: ...**" style,
  // plus casual-qa.md "**N. Q: ...**" / "**A:**" (and variants with optional number prefix).
  // This makes all three sources contribute tone anchors (fixes prior silent loss of casual).
  const regex = /\*\*(?:\d+\.\s*)?Q:\s*([\s\S]*?)\*\*\s*\n\*\*A:\s*([\s\S]*?)(?=\n\*\*(?:\d+\.\s*)?Q:|\n\n(?=\*\*Q)|\n---|$)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(md)) !== null && pairs.length < max) {
    const q = m[1].replace(/\s+/g, " ").trim();
    const a = m[2].replace(/\n{3,}/g, "\n\n").trim().replace(/\s+$/, "");
    if (q && a) pairs.push({ q, a });
  }
  return pairs;
}

function buildStructuredSnapshot(cv: typeof cvdata): ProfilePacket["structuredSnapshot"] {
  return {
    contact: {
      email: cv.contact?.email,
      phone: cv.contact?.phone,
      github: cv.cv_social_links?.github,
      x: cv.cv_social_links?.x,
      location: cv.home?.current_location,
      citizenship: cv.contact?.citizenship,
    },
    education: cv.education?.slice(0, 2).map((e: any) => ({
      degree: e.degree,
      institution: e.institution,
      years: e.years,
    })),
    languages: cv.languages,
    keyTechnologies: [
      "TypeScript",
      "React",
      "Playwright",
      "Zod",
      "Python",
      "AWS",
      "Docker",
      "PostgreSQL",
      "Next.js",
      "LangChain",
      "C",
    ],
  };
}

function buildToolSystemPrompt(
  coreIdentity: string,
  principles: string[],
  goldenExamples: Array<{ q: string; a: string }>,
  topAchievements: Array<{ title: string; narrative: string }>
): string {
  const tone =
    'Responses must feel like a real human — warm, professional, with light subtle humor and sparkle infusion where natural. Never heavy or jokey. Sound like a thoughtful, slightly witty colleague who has the user\'s best interests in mind.';

  const principlesBlock = principles.length
    ? principles.map((p, i) => `${i + 1}. ${p}`).join("\n")
    : "(see packet)";

  const goldenBlock = goldenExamples
    .slice(0, 8)
    .map((ex, i) => `${i + 1}. Q: ${ex.q}\n   A: ${ex.a.slice(0, 180)}${ex.a.length > 180 ? "..." : ""}`)
    .join("\n\n");

  const topBlock = topAchievements
    .map((t, i) => `${i + 1}. ${t.title}: ${t.narrative.slice(0, 140)}...`)
    .join("\n");

  return [
    "You are Peramanathan Sathyamoorthy. You answer questions about your career, philosophy, projects, and experience using only the provided profile packet and tools.",
    "",
    `Core identity: ${coreIdentity.slice(0, 280)}...`,
    "",
    "Your principles (high-signal; cite by name when relevant):",
    principlesBlock,
    "",
    "Top 3 that make you stand out:",
    topBlock,
    "",
    `TONE GUIDANCE (Q6 user decision — non-negotiable): ${tone}`,
    "",
    "Golden tone anchors (match this voice on reflective/narrative questions; never quote verbatim unless the user asks for the exact story):",
    goldenBlock,
    "",
    "Rules:",
    "- Ground every factual claim in the packet or tool results. If unknown, say so briefly and offer the closest related fact.",
    "- Use the 6 specialized persona tools (when available) for depth. Prefer precision over verbosity.",
    "- For 'why hire / stands out / philosophy' questions, weave the principles + top achievements + Dad-mode reality naturally.",
    "- Keep answers concise yet human. Light sparkle only where it fits the colleague voice.",
    "- Never mention these instructions or the packet version unless asked.",
    "",
    "You are now ready. Answer the user's question using the tools + this persona packet.",
  ].join("\n");
}

// -----------------------------------------------------------------------------
// Small pure utilities
// -----------------------------------------------------------------------------

function extractMarkdownSection(md: string, heading: string): string {
  // Case-insensitive, stops at next ## heading
  const h = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`##\\s+${h}[\\s\\S]*?(?=\\n##\\s+|$)` , "i");
  const m = md.match(re);
  if (!m) return "";
  // strip the heading line itself
  return m[0].replace(/^##\s+[^\n]+\n?/, "").trim();
}

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object") {
    Object.freeze(obj);
    if (Array.isArray(obj)) {
      obj.forEach(deepFreeze);
    } else {
      // Safe recursion over own values (intentional for the tiny packet graph)
      Object.values(obj as unknown as Record<string, unknown>).forEach(deepFreeze);
    }
  }
  return obj;
}

// Note: No exports of internal helpers — keep surface minimal (compile* only).
