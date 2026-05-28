import { runProfileQA as runSimpleQa } from "@/lib/qa/profile-qa-generator";
import { qaCache } from "@/utils/qa-utils";

/**
 * 8-PRs Reactor integration (optional advanced path)
 *
 * - Default: Pure simple path from PR #48 (hybrid retrieval + golden matching + optional Ollama).
 *   → No xAI Collections, no @ai-sdk/xai, no heavy reactor code is even loaded.
 *
 * - When ENABLE_XAI_REACTOR=true: Dynamically loads the full agentic reactor
 *   (xAI Collections + AI SDK + persona tools + defense layers).
 *
 * This dynamic import is intentional so the default /qa experience stays lightweight
 * and doesn't pull in the experimental reactor dependencies.
 */
async function getReactorFunctionsIfEnabled() {
  if (process.env.ENABLE_XAI_REACTOR !== "true") {
    return null;
  }

  try {
    const mod = await import("@/lib/qa/runProfileQA");
    return {
      runAgenticReactor: mod.runProfileQA,
      toLegacyCompatible: mod.toLegacyCompatible,
    };
  } catch (e) {
    console.error("[qa] Failed to dynamically load reactor modules", e);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ message: "Query required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // === Optional Reactor path (the 8-PRs agentic work) ===
    // Only loads the heavy reactor code when explicitly enabled.
    // This keeps the default /qa experience (PR #48 simple path) completely clean.
    if (process.env.ENABLE_XAI_REACTOR === "true") {
      const reactor = await getReactorFunctionsIfEnabled();
      if (reactor) {
        try {
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            undefined;

          const reactorRes = await reactor.runAgenticReactor(question, { ip, headers: request.headers });

          // Always compute details first (from reactor tool results) so we can log it safely
          // This makes the response compatible with the new ProfileQA UI (from PR #48)
          const toolResults =
            "toolResults" in reactorRes && reactorRes.toolResults ? reactorRes.toolResults : [];
          const details = toolResults.map((tr, i) => ({
            text: String(tr.result || "(no content returned by tool)"),
            section: tr.toolName || `tool-${i}`,
            similarity: 1,
          }));

          // Prefer the direct answer we extracted in the reactor
          const hasDirectAnswer = !!reactorRes.answer;
          const answerLength = reactorRes.answer?.length ?? 0;

          console.log('[qa-reactor] received from reactor:', {
            hasAnswer: hasDirectAnswer,
            answerLength,
            detailsCount: details.length,
            version: reactorRes.version,
          });

          const responseBody = hasDirectAnswer
            ? {
                answer: reactorRes.answer,
                details,
                strategy: 'reactor',
                version: reactorRes.version,
              }
            : await reactor.toLegacyCompatible(reactorRes);

          if (hasDirectAnswer) {
            console.log('[qa-reactor] returning reactor answer in PR48-compatible shape (length:', answerLength, ')');
          }

          return new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "X-QA-Reactor": "1",
            },
          });
        } catch (reactorErr) {
          console.error("[qa-reactor] error, falling back to simple path", reactorErr);
          // Fall through to the simple generator below
        }
      }
    }

    // === Simple / default path (from PR #48) ===
    if (qaCache.has(question)) {
      const cachedResponse = qaCache.get(question);
      return new Response(JSON.stringify(cachedResponse), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const response = await runSimpleQa(question);
    qaCache.set(question, response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
