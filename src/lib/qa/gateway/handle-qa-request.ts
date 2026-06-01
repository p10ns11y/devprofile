import { isQARectorEnabled, resolveQaMode } from "../config/resolve-qa-mode";
import { runProfileQA as runLocalIndexQa } from "../profile-qa-generator";
import { qaCache } from "../qa-cache";
import type { ProfileQAResponse } from "../runProfileQA";
import { isReactorEmptyNarrativePlaceholder } from "../shared/reactor-answer-fallback";
import { reactorResponseHeaders, type VisitorQaResponse } from "../shared/response-mapper";
import type { QAResponse } from "../types";

export interface QaRequestContext {
  ip?: string;
  headers?: Headers;
}

function mapToolResultsToDetails(
  toolResults: Array<{ toolName: string; result: string }>
): QAResponse["details"] {
  return toolResults.map((tr, i) => ({
    text: String(tr.result || "(no content returned by tool)"),
    section: tr.toolName || `tool-${i}`,
    similarity: 0.5,
  }));
}

function detailsFromReactor(reactorRes: ProfileQAResponse): QAResponse["details"] {
  if (reactorRes.retrievedChunks?.length) {
    return reactorRes.retrievedChunks;
  }
  const toolResults = reactorRes.toolResults ?? [];
  return mapToolResultsToDetails(toolResults);
}

async function runAgenticPath(question: string, ctx: QaRequestContext): Promise<VisitorQaResponse> {
  const { runProfileQA } = await import("../runProfileQA");
  const reactorRes = await runProfileQA(question, {
    ip: ctx.ip,
    headers: ctx.headers,
  });

  const details = detailsFromReactor(reactorRes as ProfileQAResponse);

  if (reactorRes.answer && !isReactorEmptyNarrativePlaceholder(reactorRes.answer)) {
    return {
      answer: reactorRes.answer,
      details,
      strategy: "reactor" as QAResponse["strategy"],
      version: "version" in reactorRes ? reactorRes.version : undefined,
      isGolden: "isGolden" in reactorRes ? reactorRes.isGolden : undefined,
      defense: "defense" in reactorRes ? reactorRes.defense : undefined,
    };
  }

  if (reactorRes.answer && isReactorEmptyNarrativePlaceholder(reactorRes.answer)) {
    console.warn("[qa-reactor] empty narrative placeholder — falling back to local-index path");
    return runLocalPath(question);
  }

  const legacy = await import("../runProfileQA").then((m) => m.toLegacyCompatible(reactorRes));
  return {
    answer: legacy.answer,
    details,
    version: legacy.version,
    isGolden: legacy.isGolden,
    defense: legacy.defense,
    strategy: "reactor",
  };
}

async function runLocalPath(question: string): Promise<VisitorQaResponse> {
  if (qaCache.has(question)) {
    return qaCache.get(question) as VisitorQaResponse;
  }
  const response = await runLocalIndexQa(question);
  qaCache.set(question, response);
  return response;
}

export async function handleQaRequest(
  question: string,
  ctx: QaRequestContext = {}
): Promise<{ body: VisitorQaResponse; responseHeaders: Record<string, string> }> {
  const trimmed = question?.trim();
  if (!trimmed) {
    throw new QaValidationError("Query required");
  }

  if (resolveQaMode() === "agentic" && isQARectorEnabled()) {
    try {
      const body = await runAgenticPath(trimmed, ctx);
      return {
        body,
        responseHeaders: reactorResponseHeaders(body.version),
      };
    } catch (reactorErr) {
      console.error("[qa-reactor] error, falling back to local path", reactorErr);
    }
  }

  const body = await runLocalPath(trimmed);
  return {
    body,
    responseHeaders: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  };
}

export class QaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QaValidationError";
  }
}
