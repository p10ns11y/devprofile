/** Profile QA index and runtime types (from post-PR #48 simple /qa surface). */

export type GenerationStrategy = "golden-match" | "template" | "ollama";

export interface RetrievedChunk {
  id?: string;
  text: string;
  section: string;
  similarity: number;
  source?: string;
}

export interface QAResponse {
  answer: string;
  details: RetrievedChunk[];
  strategy?: GenerationStrategy;
  /** Present when Ollama was selected but failed; answer came from template fallback. */
  ollamaError?: string;
}

export interface IndexChunk {
  id: string;
  text: string;
  contextualText: string;
  embedding: number[];
  section: string;
  source: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface GoldenQuestionEntry {
  id: string;
  question: string;
  idealAnswer: string;
  questionEmbedding: number[];
  tier?: string;
}

export interface Bm25Doc {
  id: string;
  tokens: string[];
}

export interface QAIndex {
  version: number;
  builtAt?: string;
  embeddingModel: string;
  chunkCount: number;
  chunks: IndexChunk[];
  goldenQuestions: GoldenQuestionEntry[];
  bm25: Bm25Doc[];
}

export interface GoldenFewShot {
  question: string;
  idealAnswer: string;
  tier?: string;
  category?: string;
}

/**
 * Core TypeScript interfaces for the xAI Agentic Profile QA Reactor (Phase 1).
 *
 * This module defines the shared data shapes used across the reactor when ENABLE_XAI_REACTOR=true.
 *
 * INVARIANTS:
 * - xAI Collections is the SOLE substrate.
 * - NO local vectors in the main reactor path.
 * - Abuse defense is the absolute first non-bypassable gate.
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md
 */

// -----------------------------------------------------------------------------
// Profile Packet (rich versioned packet for the agentic reactor)
// -----------------------------------------------------------------------------

export interface ProfilePacket {
  version: "v1-2026-05" | string;
  compiledAt: string;

  /** High-signal narrative identity from ps-profile-v1.md + cvdata */
  coreIdentity: string;

  /** Principles / philosophy bullets */
  principles: string[];

  /** Top 3 achievements */
  topAchievements: Array<{ title: string; narrative: string }>;

  /** Experience highlights with impacts */
  experienceHighlights: Array<{
    company: string;
    title: string;
    duration: string;
    impacts: string[];
  }>;

  /** Signature projects */
  signatureProjects: Array<{
    name: string;
    description: string;
    impact?: string;
    tech: string[];
  }>;

  /** Golden Q&A tone anchors for system prompt + fallback */
  goldenExamples: Array<{ q: string; a: string }>;

  /** Minimal structured snapshot for factual grounding */
  structuredSnapshot: {
    contact?: Record<string, unknown>;
    education?: unknown;
    languages?: unknown;
    keyTechnologies?: string[];
  };

  /** Full markdown blob ready for xAI Collections upload */
  ingestDocument: string;

  /** Specialized instructions for the 6 persona tools */
  toolSystemPrompt: string;
}

// -----------------------------------------------------------------------------
// Abuse Defense (4-layer, non-bypassable)
// -----------------------------------------------------------------------------

export interface AbuseConfig {
  edge: {
    ipPer5m: number;
    sessionPer3m: number;
  };
  semantic: {
    minRelevance: number;
    useGrokProbe: boolean;
  };
  behavioral: {
    maxRepetition: number;
    maxDrift: number;
    windowSize: number;
  };
  hardCaps: {
    ipPerDay: number;
    ipPerHour: number;
  };
}

export interface AbuseResult {
  blocked: boolean;
  reason?:
    | "rate-limit"
    | "low-semantic-relevance"
    | "behavioral-anomaly"
    | "daily-cap"
    | "hourly-cap"
    | "off-topic"
    | "prompt-injection"
    | string;
  layer?: "edge" | "semantic" | "behavioral" | "hard-cap" | string;
  /** Pre-computed golden fallback answer served on block */
  goldenAnswer?: string;
}

// -----------------------------------------------------------------------------
// Tool Shapes (for the 6 specialized Collections-backed tools)
// -----------------------------------------------------------------------------

export interface SearchResult {
  chunks: Array<{
    text: string;
    metadata?: Record<string, unknown>;
    score?: number;
  }>;
  citations: string[];
}

export interface PersonaTool {
  name: string;
  description: string;
  parameters: unknown;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

export type PersonaToolRegistry = Record<string, PersonaTool>;
