import type { QAResponse } from "../types";

export interface VisitorQaResponse extends QAResponse {
  version?: string;
  isGolden?: boolean;
  defense?: { blocked: boolean; reason?: string; layer?: string };
}

export function toJsonBody(res: VisitorQaResponse): string {
  return JSON.stringify({
    answer: res.answer,
    details: res.details,
    ...(res.strategy ? { strategy: res.strategy } : {}),
    ...(res.ollamaError ? { ollamaError: res.ollamaError } : {}),
    ...(res.version ? { version: res.version } : {}),
    ...(res.isGolden !== undefined ? { isGolden: res.isGolden } : {}),
    ...(res.defense ? { defense: res.defense } : {}),
  });
}

export function reactorResponseHeaders(version?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-QA-Reactor": "1",
    ...(version ? { "X-QA-Version": version } : {}),
  };
}

/** Streaming hook for future SSE (Scenario extension). */
export function supportsSseStream(_accept: string | null): boolean {
  return false;
}
