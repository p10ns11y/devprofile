/**
 * Agentic Tools: 6 Specialized Collections-Backed Tools (PR 5).
 *
 * Ports the exact 6-tool pattern from the canary that delivered coherent, grounded,
 * high-quality answers. Each tool is a *thin* wrapper around the PR3 collectionsClient
 * (search only; specialization via query prefix/shaping + rich description).
 *
 * - No direct Grok calls inside tools.
 * - No vector/embed/local index code whatsoever (sole substrate invariant).
 * - Rich, human-sounding descriptions (warm, professional, light sparkle per Q6 tone
 *   guidance baked into ProfilePacket and types.ts) to help Grok route correctly.
 * - Returns grounded text + citations for the LLM context.
 * - Fully standalone + unit-testable with a mocked client (no real keys, no network).
 *
 * SKELETON STATUS (validation gate): Per explicit design rule, PR5 is the first "heavy"
 * implementation PR and is gated behind the filled 45-question validation template
 * (>=70% shippable bar on narrative cases) + economics sign-off + design update.
 * This file delivers the *complete contract*, thin impl scaffolding, and full test
 * coverage now so that post-validation enrichment (exact phrasing, packet.toolSystemPrompt
 * integration, refined k/shaping, additional edge behavior) is a minimal, safe delta
 * before PR6 reactor wiring. All current descriptions are high-signal initial ports
 * adapted from canary + design bullets; they already feel human and route well.
 *
 * The reactor (PR6) will import the registry (or aiPersonaTools) for one-shot registration
 * into streamText + step-bounded tool loops.
 *
 * Implementation Notes (design fidelity):
 * - Adapted from design sketch (lines ~223-230) for real ai@^6.0.0 (inputSchema + ReturnType
 *   inference in isolated module; the `any` for ToolPair is the minimal documented escape).
 * - k=5 chosen as compromise between design example (4) and client DEFAULT_SEARCH_K (8).
 * - Citations + empty handling centralized in formatSearchResults for consistency across all 6.
 * - "no collection_ids" client warning is emitted on every call (skeleton phase; PR6 will
 *   supply collection context). Synthesized citations fallback (client:349) not hit until then.
 * - Full citation URIs + filters will be populated once PR6 supplies collection context (TODO).
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (Proposed Design § Agentic Tools, PR5 plan, Q6)
 * @see src/lib/qa/types.ts (PersonaTool, PersonaToolRegistry, tone guidance)
 * @see src/lib/qa/xai-collections.ts (the client these tools exclusively call)
 */

import { tool } from "ai";
import { z } from "zod";
import type { PersonaTool, PersonaToolRegistry, SearchResult } from "./types";
import { collectionsClient } from "./xai-collections";

// -----------------------------------------------------------------------------
// Shared formatting (citation handling + consistent shape for LLM consumption)
// -----------------------------------------------------------------------------
const DEFAULT_K = 5;

function formatSearchResults(result: SearchResult): string {
  if (!result.chunks || result.chunks.length === 0) {
    return "No matching excerpts found in the profile collection for this query.";
  }

  const body = result.chunks
    .map((chunk, index) => {
      const score = typeof chunk.score === "number" ? ` (score: ${chunk.score.toFixed(3)})` : "";
      const meta =
        chunk.metadata && Object.keys(chunk.metadata).length > 0
          ? ` ${JSON.stringify(chunk.metadata)}`
          : "";
      return `[${index + 1}] ${chunk.text}${score}${meta}`;
    })
    .join("\n\n---\n\n");

  const cites =
    result.citations && result.citations.length > 0
      ? `\n\nCitations: ${result.citations.join(" ")}`
      : "";

  return body + cites;
}

// Test-only export of pure helper for isolated unit tests (Issue 6 review feedback).
// Zero runtime cost; not part of public API.
export { formatSearchResults as __TEST_ONLY_formatSearchResults };

// -----------------------------------------------------------------------------
// Tool factory (keeps the module tiny, consistent, and reviewable)
// Each tool is 100% collectionsClient.search + specialization. Testable in isolation.
// -----------------------------------------------------------------------------
interface ToolPair {
  aiTool: any; // Concrete AI SDK Tool<{query:string}, string> from v6+ (inputSchema API); opaque handle passed to streamText() by reactor. ReturnType<typeof tool> infers never in this isolated declaration.
  personaTool: PersonaTool;
}

function createSpecializedTool(
  name: string,
  description: string,
  queryPrefix: string,
  queryDescribe: string
): ToolPair {
  const parameters = z.object({
    query: z.string().describe(queryDescribe),
  });

  // The pure execute (easy to unit test directly with mocked client)
  const execute = async ({ query }: { query: string }) => {
    const q = (query ?? "").trim();
    if (!q) {
      return "Please provide a specific, non-empty query for this persona tool.";
    }
    const res = await collectionsClient.search(`${queryPrefix}: ${q}`, { k: DEFAULT_K });
    return formatSearchResults(res);
  };

  const aiTool = tool({
    description,
    inputSchema: parameters,
    execute,
  });

  const personaTool: PersonaTool = {
    name,
    description,
    parameters,
    execute: async (args: Record<string, unknown>) => {
      const q = (args as { query?: string }).query ?? "";
      return execute({ query: typeof q === "string" ? q : String(q) });
    },
  };

  return { aiTool, personaTool };
}

// -----------------------------------------------------------------------------
// 1. Broad profile / CV search (entry point for cross-cutting or ambiguous queries)
// -----------------------------------------------------------------------------
const profileSearchDescription =
  "Broad semantic search over the entire professional persona — experience highlights, skills, signature projects, education, and guiding principles. Perfect first tool for open-ended or multi-domain questions like 'tell me about yourself', career turning points, or when the more specialized tools are not the obvious fit. Always returns cited excerpts for traceability.";

const profileSearchPair = createSpecializedTool(
  "profileSearch",
  profileSearchDescription,
  "professional profile",
  'Natural-language query about background, roles, skills, projects, education or philosophy (e.g. "what shaped your approach to building" or "key themes across my career")'
);

export const profileSearchTool = profileSearchPair.aiTool;

// -----------------------------------------------------------------------------
// 2. Work experience (Oneflow focus + prior roles, impacts, tech transformations)
// -----------------------------------------------------------------------------
const workExperienceDescription =
  "Precise details on professional roles, responsibilities, leadership, and concrete impacts — with special strength on the Oneflow era (TypeScript migrations, Playwright E2E rewrites, platform transformations). Use for timeline, achievement, or 'how did you drive X' questions. Delivers focused, citable excerpts rather than generic summaries.";

const workExperiencePair = createSpecializedTool(
  "workExperience",
  workExperienceDescription,
  "work experience Oneflow",
  'Specific aspect of work history or impact (e.g. "TypeScript migration outcomes" or "Playwright E2E rewrite at Oneflow" or "leadership in platform team")'
);

export const workExperienceTool = workExperiencePair.aiTool;

// -----------------------------------------------------------------------------
// 3. Skills (categorized depth, AI-era senior capabilities, technical judgment)
// -----------------------------------------------------------------------------
const skillsDescription =
  "Categorized technical skills, languages, frameworks, and senior AI-era practices (architecture, long-term technical debt forecasting, pragmatic simplification). Ideal for capability questions, stack deep-dives, or 'how do you think about Y technology' queries. Emphasizes judgment over laundry lists.";

const skillsPair = createSpecializedTool(
  "skills",
  skillsDescription,
  "skills expertise",
  'Skill, technology, practice area or judgment question (e.g. "TypeScript ecosystem choices" or "how you approach long-term technical debt" or "frontend architecture principles")'
);

export const skillsTool = skillsPair.aiTool;

// -----------------------------------------------------------------------------
// 4. Projects (signature work + open source + portfolio exemplars)
// -----------------------------------------------------------------------------
const projectsDescription =
  "Signature projects, open-source contributions, and portfolio pieces — including premflow, arch-machine, Grok Dia experiments, Zod ecosystem work, devprofile tooling, and the .agents portable skills system. Use when you need implementation-level detail, architectural decisions, or concrete examples of craft.";

const projectsPair = createSpecializedTool(
  "projects",
  projectsDescription,
  "projects portfolio",
  'Project name, technology, or outcome-focused query (e.g. "premflow architecture" or "Zod contribution impact" or "devprofile agent skills design")'
);

export const projectsTool = projectsPair.aiTool;

// -----------------------------------------------------------------------------
// 5. Education & background (thesis, context, early formation)
// -----------------------------------------------------------------------------
const educationAndBackgroundDescription =
  "Academic formation, thesis work (EEaaS / epic predictor concepts), Master's experience, and the personal/cultural context (Stockholm base, Swedish-Indian heritage, Dad-mode realities) that inform the builder philosophy. Use for origin, motivation, or 'why do you see systems this way' questions.";

const educationAndBackgroundPair = createSpecializedTool(
  "educationAndBackground",
  educationAndBackgroundDescription,
  "education background thesis",
  'Question about academic background, thesis, or formative context (e.g. "EEaaS thesis core idea" or "how Stockholm and family shaped your thinking")'
);

export const educationAndBackgroundTool = educationAndBackgroundPair.aiTool;

// -----------------------------------------------------------------------------
// 6. Principles & philosophy (the 'why' layer — highest signal for reflective answers)
// -----------------------------------------------------------------------------
const principlesAndPhilosophyDescription =
  "Guiding principles and operating philosophy: premflow and the EEaaS thesis, simplification as a moral act, Dad-mode realism versus pure builder mode, converting everyday friction into public leverage, and the outsized value of quiet, reliable infrastructure. The tool that makes answers feel coherent and values-aligned on reflective or 'how do you work' questions.";

const principlesAndPhilosophyPair = createSpecializedTool(
  "principlesAndPhilosophy",
  principlesAndPhilosophyDescription,
  "principles philosophy",
  'Reflective or values question (e.g. "why simplification matters to you" or "Dad-mode vs builder mode" or "friction to public leverage in practice")'
);

export const principlesAndPhilosophyTool = principlesAndPhilosophyPair.aiTool;

// -----------------------------------------------------------------------------
// One-shot registry export (reactor registers the whole set in a single line)
// Also export the raw AI SDK tools for direct streamText({ tools: aiPersonaTools })
// -----------------------------------------------------------------------------
export const personaToolRegistry: PersonaToolRegistry = {
  profileSearch: profileSearchPair.personaTool,
  workExperience: workExperiencePair.personaTool,
  skills: skillsPair.personaTool,
  projects: projectsPair.personaTool,
  educationAndBackground: educationAndBackgroundPair.personaTool,
  principlesAndPhilosophy: principlesAndPhilosophyPair.personaTool,
};

export const aiPersonaTools = {
  profileSearch: profileSearchPair.aiTool,
  workExperience: workExperiencePair.aiTool,
  skills: skillsPair.aiTool,
  projects: projectsPair.aiTool,
  educationAndBackground: educationAndBackgroundPair.aiTool,
  principlesAndPhilosophy: principlesAndPhilosophyPair.aiTool,
} as const;

// -----------------------------------------------------------------------------
// Test-only helpers (single source of truth for shaping fidelity in tests only)
// Never used at runtime. Enables DRY exact ^prefix$ asserts post-validation.
// -----------------------------------------------------------------------------
export const __TEST_ONLY_TOOL_PREFIXES__ = {
  profileSearch: "professional profile",
  workExperience: "work experience Oneflow",
  skills: "skills expertise",
  projects: "projects portfolio",
  educationAndBackground: "education background thesis",
  principlesAndPhilosophy: "principles philosophy",
} as const;

// -----------------------------------------------------------------------------
// Named export surface (matches canary cvTools style for familiarity in reactor)
// -----------------------------------------------------------------------------
export const personaTools = {
  profileSearchTool,
  workExperienceTool,
  skillsTool,
  projectsTool,
  educationAndBackgroundTool,
  principlesAndPhilosophyTool,
} as const;

// Type-level helper for future reactor (exact keys)
export type PersonaToolName = keyof typeof aiPersonaTools;
