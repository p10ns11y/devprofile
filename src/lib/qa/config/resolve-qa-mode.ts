export type QaMode = "local-index" | "agentic";
export type AgenticRetrieval = "xai-collections" | "local-profile-files";

export function isQARectorEnabled(): boolean {
  return process.env.ENABLE_XAI_REACTOR === "true";
}

export function resolveQaMode(): QaMode {
  return isQARectorEnabled() ? "agentic" : "local-index";
}

export function resolveAgenticRetrieval(): AgenticRetrieval {
  if (process.env.USE_LOCAL_PROFILE_DATA === "true") {
    return "local-profile-files";
  }
  const hasKey =
    !!process.env.XAI_MANAGEMENT_API_KEY?.trim() || !!process.env.XAI_API_KEY?.trim();
  const hasCollection = !!process.env.XAI_PROFILE_COLLECTION?.trim();
  if (hasKey && hasCollection) {
    return "xai-collections";
  }
  return "local-profile-files";
}
