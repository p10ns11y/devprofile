/**
 * Agentic Tools: 6 Specialized Tools (PR 5).
 *
 * Each tool is a thin wrapper around a search backend.
 * - In normal / production mode: uses xAI Collections (via collectionsClient).
 * - In local dev: when USE_LOCAL_PROFILE_DATA=true, uses in-memory search over persona files.
 *
 * This allows full reactor + tool-calling development locally without exposing
 * management keys or requiring a live Collections collection.
 *
 * The reactor (PR6) registers the tools via aiPersonaTools or personaToolRegistry.
 */

import { tool } from "ai";
import { z } from "zod";
import { searchProfile } from "./agentic/tools/search-backend";
import { mergeRetrievedChunks, searchResultToDetails } from "./shared/map-search-to-details";
import type { PersonaTool, PersonaToolRegistry, RetrievedChunk, SearchResult } from "./types";

// -----------------------------------------------------------------------------
// Retrieved chunk collector — structured passages for UI "Retrieved information"
// -----------------------------------------------------------------------------
const retrievedChunksCollector: RetrievedChunk[] = [];

export function resetRetrievedChunksCollector() {
  retrievedChunksCollector.length = 0;
}

export function recordRetrievedChunks(toolName: string, result: SearchResult) {
  retrievedChunksCollector.push(...searchResultToDetails(result, toolName));
}

export function getRetrievedChunksForUI(): RetrievedChunk[] {
  return mergeRetrievedChunks(retrievedChunksCollector);
}

/**
 * Run one profile search before streamText so retrieval + UI chunks exist even when
 * Grok skips tool calls (common cause of the empty-narrative placeholder).
 */
export async function preflightProfileRetrieval(query: string): Promise<void> {
  try {
    const result = await searchProfile(query, { k: 5 });
    recordRetrievedChunks("profileSearch", result);
    recordManualToolResult("profileSearch", formatSearchResults(result));
  } catch (error) {
    console.warn(
      "[persona-reactor] preflight retrieval failed",
      error instanceof Error ? error.message : error
    );
  }
}

// -----------------------------------------------------------------------------
// Shared formatting (citation handling + consistent shape for LLM consumption)
// -----------------------------------------------------------------------------
const DEFAULT_K = 5;

function formatSearchResults(result: SearchResult): string {
  const chunks = result?.chunks || [];

  if (chunks.length === 0) {
    return "No matching excerpts found in the profile collection for this query.";
  }

  // Build body, but be extremely defensive: never let completely empty text win if we have data.
  const body = chunks
    .map((chunk, index) => {
      let text = (chunk.text || "").trim();

      // Last-ditch recovery: pull from metadata if the main text extraction somehow missed it
      if (!text && chunk.metadata) {
        const meta = chunk.metadata as any;
        text = (meta.chunk_content || meta.content || meta.text || meta.value || "")
          .toString()
          .trim();
      }

      if (!text) {
        // Absolute fallback so the model at least knows something was retrieved
        text = "(content available in raw metadata)";
      }

      const score = typeof chunk.score === "number" ? ` (score: ${chunk.score.toFixed(3)})` : "";
      const metaStr =
        chunk.metadata && Object.keys(chunk.metadata).length > 0
          ? ` ${JSON.stringify(chunk.metadata)}`
          : "";
      return `[${index + 1}] ${text}${score}${metaStr}`;
    })
    .join("\n\n---\n\n");

  const cites =
    result.citations && result.citations.length > 0
      ? `\n\nCitations: ${result.citations.join(" ")}`
      : "";

  const final = (body + cites).trim();

  // Never return a truly empty string to the model when we had hits
  if (!final) {
    return "Retrieved relevant excerpts from the profile collection (see tool metadata for details).";
  }

  return final;
}

// Test-only export of pure helper for isolated unit tests (Issue 6 review feedback).
// Zero runtime cost; not part of public API.
export { formatSearchResults as __TEST_ONLY_formatSearchResults };

// -----------------------------------------------------------------------------
// Manual Collection Tool Result Collector (thorough fix for "still same issue")
// When XAI_PROFILE_COLLECTION is set, the old AI SDK steps.toolResults path has
// proven unreliable for surfacing actual content to both the model and the UI.
// We now own the successful tool outputs ourselves for the manual collection dev path.
// This is the changed approach after many iterations.
const manualToolResults: Array<{ toolName: string; result: string }> = [];

export function resetManualToolResultsCollector() {
  manualToolResults.length = 0;
}

export function recordManualToolResult(toolName: string, result: string) {
  if (process.env.XAI_PROFILE_COLLECTION) {
    manualToolResults.push({ toolName, result: String(result || "") });
  }
}

export function getManualToolResults() {
  return [...manualToolResults];
}

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

  const execute = async ({ query }: { query: string }) => {
    const q = (query ?? "").trim();
    if (!q) {
      return "Please provide a specific, non-empty query for this persona tool.";
    }

    try {
      const res = await searchProfile(`${queryPrefix}: ${q}`, { k: DEFAULT_K });
      recordRetrievedChunks(name, res);
      const formatted = formatSearchResults(res);

      const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
      if (manualCollection) {
        console.log(
          `[tool-debug:${name}] queryPrefix="${queryPrefix}" qLen=${q.length} formattedLen=${formatted.length} preview=${formatted.slice(0, 180)}`
        );
        recordManualToolResult(name, formatted);
      }

      return formatted;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[tool:${name}] search failed: ${msg}`);
      return `Search temporarily unavailable for this tool (${msg}). Try rephrasing or ask a broader question.`;
    }
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
