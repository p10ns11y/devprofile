import { handleQaRequest } from "@/lib/qa/gateway/handle-qa-request";
import type { ProfileSearchResult } from "./types";

export async function searchProfileForVoice(
  query: string,
  ctx: { ip?: string; headers?: Headers } = {}
): Promise<ProfileSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { answer: "I need a specific question to search the profile.", details: [] };
  }

  const { body } = await handleQaRequest(trimmed, {
    ip: ctx.ip,
    headers: ctx.headers,
  });

  return {
    answer: body.answer,
    details: (body.details ?? []).map((d) =>
      typeof d === "string" ? d : (d.text ?? "")
    ),
  };
}
