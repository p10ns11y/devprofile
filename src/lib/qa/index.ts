/** Public barrel for Profile Q&A (local-index + agentic paths). */

export type { CheckAbuseContext } from "./abuse-defense";
export {
  checkAbuse,
  computeGoldenFallback,
  getGoldenFallbackDetails,
  resetAbuseStateForTests,
} from "./abuse-defense";
export type { AgenticRetrieval, QaMode } from "./config/resolve-qa-mode";
export {
  isQARectorEnabled,
  resolveAgenticRetrieval,
  resolveQaMode,
} from "./config/resolve-qa-mode";
export { withLightweightRetry } from "./durable-retry";
export type { QaRequestContext } from "./gateway/handle-qa-request";
export { handleQaRequest, QaValidationError } from "./gateway/handle-qa-request";
export {
  findGoldenMatch,
  resolveGoldenAnswer,
} from "./golden-routing";
export type { ProfileSources } from "./persona-compiler";
export {
  compileProfilePacket,
  compileProfilePacketFromRawSources,
  compileProfilePacketFromSources,
  Q6_TONE_GUIDANCE,
} from "./persona-compiler";
export type { PersonaToolName } from "./persona-tools";
export {
  __TEST_ONLY_formatSearchResults,
  __TEST_ONLY_TOOL_PREFIXES__,
  aiPersonaTools,
  educationAndBackgroundTool,
  personaToolRegistry,
  personaTools,
  principlesAndPhilosophyTool,
  profileSearchTool,
  projectsTool,
  skillsTool,
  workExperienceTool,
} from "./persona-tools";
export { runProfileQA as runLocalIndexQa } from "./profile-qa-generator";
export { qaCache } from "./qa-cache";
export type {
  AbuseConfig,
  AbuseResult,
  CollectionRef,
  IngestResult,
  PersonaTool,
  PersonaToolRegistry,
  ProfilePacket,
  QAResponse,
  SearchResult,
} from "./types";
export {
  collectionsClient,
  XaiCollectionsApiError,
  XaiCollectionsConfigError,
  XaiCollectionsError,
  XaiCollectionsTimeoutError,
} from "./xai-collections";

export const QA_REACTOR_FLAG = "qaReactor" as const;
export const NO_LOCAL_VECTORS_COMMENT =
  "xAI Collections is the sole substrate. No local vectors in reactor path. See types.ts header.";
