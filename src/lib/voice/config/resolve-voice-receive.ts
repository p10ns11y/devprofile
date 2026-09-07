/**
 * Voice receive feature flag — server kill switch.
 * UI links use NEXT_PUBLIC_ENABLE_VOICE_RECEIVE (build-time).
 */
export function isVoiceReceiveEnabled(): boolean {
  return process.env.ENABLE_VOICE_RECEIVE === "true";
}

export function isVoiceReceivePublic(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_VOICE_RECEIVE === "true";
}

export function hasVoiceRealtimeCredentials(): boolean {
  return !!process.env.XAI_API_KEY?.trim();
}

export function resolveProfileCollectionId(): string | undefined {
  return process.env.XAI_PROFILE_COLLECTION?.trim() || undefined;
}
