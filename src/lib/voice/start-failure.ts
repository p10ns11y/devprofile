import type { VoiceSessionStatus } from "@/lib/voice/realtime-client";

export const VOICE_UNAVAILABLE = "Voice is unavailable right now";

export const VOICE_UNAVAILABLE_HINT =
  "Voice calls are unavailable right now. Text Q&A has the same answers.";

export const MICROPHONE_HINT =
  "Check microphone permission and that voice receive is enabled on this deployment.";

const MICROPHONE_FALLBACK = "Microphone permission was denied or no microphone was found.";

const PERMISSION_NAMES = new Set(["NotAllowedError", "PermissionDeniedError"]);
const DEVICE_NAMES = new Set(["NotFoundError", "DevicesNotFoundError"]);

export type VoiceFailureKind = "microphone" | "unavailable";

export type VoiceFailureCopy = {
  kind: VoiceFailureKind;
  message: string;
  hint: string;
};

function errorName(error: unknown): string {
  if (typeof error === "object" && error !== null && "name" in error) {
    const name = error.name;
    if (typeof name === "string") return name;
  }
  return "";
}

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "";
}

export function isMicrophoneAccessError(error: unknown): boolean {
  const name = errorName(error);
  if (PERMISSION_NAMES.has(name) || DEVICE_NAMES.has(name)) return true;

  const message = errorText(error).toLowerCase();
  return (
    message.includes("permission denied") ||
    message.includes("denied permission") ||
    message.includes("not allowed by the user agent") ||
    message.includes("requested device not found") ||
    message.includes("device not found") ||
    message.includes("devices not found") ||
    message.includes("no microphone") ||
    message.includes("no device")
  );
}

export function presentVoiceStartError(error: unknown): VoiceFailureCopy {
  if (isMicrophoneAccessError(error)) {
    const message = errorText(error).trim() || MICROPHONE_FALLBACK;
    return { kind: "microphone", message, hint: MICROPHONE_HINT };
  }

  return {
    kind: "unavailable",
    message: VOICE_UNAVAILABLE,
    hint: VOICE_UNAVAILABLE_HINT,
  };
}

export function voiceStatusHint(
  status: VoiceSessionStatus,
  failure: VoiceFailureCopy | null,
  statusHints: Record<VoiceSessionStatus, string>
): string {
  if (failure?.kind === "microphone") return statusHints.error;
  if (failure) return failure.hint;
  return statusHints[status];
}
