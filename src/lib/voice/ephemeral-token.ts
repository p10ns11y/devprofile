import { resolveProfileCollectionId } from "./config/resolve-voice-receive";
import {
  VOICE_AGENT_VOICE,
  VOICE_ASR_KEYTERMS,
  VOICE_END_CALL_TOOL,
  VOICE_EPHEMERAL_TTL_SECONDS,
  VOICE_LEAVE_MESSAGE_TOOL,
  VOICE_PROFILE_SEARCH_TOOL,
  VOICE_PRONUNCIATION_REPLACE,
  VOICE_REALTIME_MODEL,
  VOICE_RECEPTIONIST_INSTRUCTIONS,
} from "./constants";
import type { EphemeralTokenResponse } from "./types";

function buildSessionTools(collectionId?: string) {
  const tools: object[] = [VOICE_LEAVE_MESSAGE_TOOL, VOICE_END_CALL_TOOL];

  if (collectionId) {
    tools.unshift({
      type: "file_search",
      vector_store_ids: [collectionId],
      max_num_results: 8,
    });
  } else {
    tools.unshift(VOICE_PROFILE_SEARCH_TOOL);
  }

  return tools;
}

export function buildVoiceSessionConfig() {
  const collectionId = resolveProfileCollectionId();

  return {
    model: VOICE_REALTIME_MODEL,
    voice: VOICE_AGENT_VOICE,
    instructions: VOICE_RECEPTIONIST_INSTRUCTIONS,
    replace: VOICE_PRONUNCIATION_REPLACE,
    turn_detection: { type: "server_vad" },
    audio: {
      input: {
        format: { type: "audio/pcm", rate: 24000 },
        transcription: {
          keyterms: VOICE_ASR_KEYTERMS,
        },
      },
      output: {
        format: { type: "audio/pcm", rate: 24000 },
      },
    },
    tools: buildSessionTools(collectionId),
  };
}

export async function mintEphemeralVoiceToken(): Promise<EphemeralTokenResponse> {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("XAI_API_KEY not configured");
  }

  const response = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expires_after: { seconds: VOICE_EPHEMERAL_TTL_SECONDS },
      session: buildVoiceSessionConfig(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`xAI client_secrets failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as EphemeralTokenResponse;
  if (!data.value || !data.expires_at) {
    throw new Error("xAI client_secrets returned invalid payload");
  }

  return data;
}
