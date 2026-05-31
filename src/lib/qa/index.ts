/** Public barrel for Profile Q&A (local-index + agentic paths). */

export { handleQaRequest, QaValidationError } from "./gateway/handle-qa-request";
export type { QaRequestContext } from "./gateway/handle-qa-request";
export {
  findGoldenMatch,
  resolveGoldenAnswer,
} from "./golden-routing";
export { isQARectorEnabled, resolveQaMode, resolveAgenticRetrieval } from "./config/resolve-qa-mode";
export type { QaMode, AgenticRetrieval } from "./config/resolve-qa-mode";

export {
  checkAbuse,
  computeGoldenFallback,
  getGoldenFallbackDetails,
  resetAbuseStateForTests,
} from "./abuse-defense";
export type { CheckAbuseContext } from "./abuse-defense";

export {
  compileProfilePacket,
  compileProfilePacketFromSources,
  compileProfilePacketFromRawSources,
  Q6_TONE_GUIDANCE,
} from "./persona-compiler";
export type { ProfileSources } from "./persona-compiler";

export { withLightweightRetry } from "./durable-retry";
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

export { qaCache } from "./qa-cache";
export { runProfileQA as runLocalIndexQa } from "./profile-qa-generator";

export const QA_REACTOR_FLAG = "qaReactor" as const;
export const NO_LOCAL_VECTORS_COMMENT =
  "xAI Collections is the sole substrate. No local vectors in reactor path. See types.ts header.";
