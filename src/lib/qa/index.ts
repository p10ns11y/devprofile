import {
  ProfilePacket,
  SearchResult,
  PersonaTool,
  PersonaToolRegistry,
} from "./types";

// PR 2: Persona Compiler (pure + packet generation)
export { compileProfilePacket, compileProfilePacketFromSources } from "./persona-compiler";
export type { ProfileSources } from "./persona-compiler"; // for pure-core callers (review #10; tests + future reactor)

// PR 3: xAI Collections Thin Client
export {
  collectionsClient,
  XaiCollectionsApiError,
  XaiCollectionsConfigError,
  XaiCollectionsError,
  XaiCollectionsTimeoutError,
} from "./xai-collections";

// Placeholder comments for future modules (no files created in this PR to keep minimal)
// export { checkAbuse } from './abuse-defense';
// export { runProfileQA } from './persona-reactor';
