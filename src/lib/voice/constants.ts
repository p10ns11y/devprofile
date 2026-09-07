/** xAI realtime WebSocket — model pinned via query param. */
export const VOICE_REALTIME_MODEL = "grok-voice-latest";

export const VOICE_REALTIME_WSS = `wss://api.x.ai/v1/realtime?model=${VOICE_REALTIME_MODEL}`;

export const VOICE_EPHEMERAL_TTL_SECONDS = 300;

/** Built-in voice — professional, clear (xAI voice roster). */
export const VOICE_AGENT_VOICE = "eve";

/** Spoken pronunciation fixes (transcript keeps original text). */
export const VOICE_PRONUNCIATION_REPLACE: Record<string, string> = {
  Peramanathan: "Per-ah-man-a-than",
  Sathyamoorthy: "Sa-thya-moor-thee",
  Thanjavur: "Than-ja-voor",
  Oneflow: "One flow",
  ensembly: "en-sembly",
  "collab-finder": "collab finder",
  kingsparrow: "king sparrow",
};

/** ASR bias for domain terms (max 100 terms). */
export const VOICE_ASR_KEYTERMS = [
  "Peramanathan",
  "Sathyamoorthy",
  "Thanjavur",
  "Oneflow",
  "ensembly",
  "collab-finder",
  "kingsparrow",
  "premflow",
  "Grok",
  "xAI",
];

export const VOICE_RECEPTIONIST_INSTRUCTIONS = `You are the voice receptionist for Peramanathan Sathyamoorthy's hire profile website — not Peramanathan himself.

Speak in second person to the caller. Keep every turn short: one idea, one or two sentences, then pause.

Answer only from your profile corpus (file_search or profile_search). Never invent salary, visa status, start dates, or binding commitments.

If the caller wants to reach Peramanathan directly, schedule time, or asks something off-corpus, offer leave_message to capture their name, contact, and topic.

You cannot make hiring decisions or promises on Peramanathan's behalf. Say you will pass messages along.

When the caller is done, use end_call with a brief goodbye.`;

export const VOICE_LEAVE_MESSAGE_TOOL = {
  type: "function" as const,
  name: "leave_message",
  description:
    "Capture a callback request when the caller wants Peramanathan to follow up. Requires name and email or phone.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Caller's name" },
      email: { type: "string", description: "Email for follow-up" },
      phone: { type: "string", description: "Phone for follow-up if no email" },
      topic: { type: "string", description: "What they want to discuss" },
      transcript_excerpt: {
        type: "string",
        description: "Brief excerpt of what was discussed",
      },
      urgency: {
        type: "string",
        enum: ["low", "normal", "high"],
        description: "How soon they need a reply",
      },
    },
    required: ["name", "topic"],
  },
};

export const VOICE_END_CALL_TOOL = {
  type: "function" as const,
  name: "end_call",
  description: "End the call after saying goodbye when the conversation is complete.",
  parameters: {
    type: "object",
    properties: {
      reason: { type: "string", description: "Brief reason for ending" },
    },
  },
};

export const VOICE_PROFILE_SEARCH_TOOL = {
  type: "function" as const,
  name: "profile_search",
  description:
    "Search Peramanathan's profile corpus for factual answers about experience, projects, skills, and background.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Question to search the profile for" },
    },
    required: ["query"],
  },
};
