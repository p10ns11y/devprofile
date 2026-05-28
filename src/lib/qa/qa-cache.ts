import type { QAResponse } from "./types";

/** In-memory per-process cache for the simple /qa path (PR #48). */
export const qaCache = new Map<string, QAResponse>();
