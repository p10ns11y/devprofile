import { describe, expect, it } from "vitest";
import type { VoiceSessionStatus } from "@/lib/voice/realtime-client";
import {
  MICROPHONE_HINT,
  presentVoiceStartError,
  VOICE_UNAVAILABLE,
  VOICE_UNAVAILABLE_HINT,
  voiceStatusHint,
} from "@/lib/voice/start-failure";

const statusHints: Record<VoiceSessionStatus, string> = {
  idle: "idle hint",
  connecting: "connecting hint",
  listening: "listening hint",
  speaking: "speaking hint",
  thinking: "thinking hint",
  error: MICROPHONE_HINT,
  ended: "ended hint",
};

describe("presentVoiceStartError", () => {
  it("shows the permission message for getUserMedia permission denial", () => {
    const error = new DOMException("Permission denied", "NotAllowedError");
    const copy = presentVoiceStartError(error);

    expect(copy.kind).toBe("microphone");
    expect(copy.message).toBe("Permission denied");
    expect(copy.hint).toBe(MICROPHONE_HINT);
    expect(voiceStatusHint("error", copy, statusHints)).toBe(statusHints.error);
  });

  it("shows the device message when getUserMedia finds no microphone", () => {
    const error = new DOMException("Requested device not found", "NotFoundError");
    const copy = presentVoiceStartError(error);

    expect(copy.kind).toBe("microphone");
    expect(copy.message).toBe("Requested device not found");
    expect(voiceStatusHint("error", copy, statusHints)).toBe(MICROPHONE_HINT);
  });

  it("recognizes permission and missing-device errors that lost their exception name", () => {
    expect(presentVoiceStartError(new Error("Permission denied")).kind).toBe("microphone");
    expect(presentVoiceStartError(new Error("Requested device not found")).message).toBe(
      "Requested device not found"
    );
  });

  it("keeps the generic unavailable copy for token, upstream, and websocket failures", () => {
    const failures = [
      new Error("Voice is unavailable right now."),
      new Error('xAI client_secrets failed (400): {"error":"Incorrect API key"}'),
      new Error("WebSocket connection failed"),
      "Incorrect API key provided",
    ];

    for (const failure of failures) {
      const copy = presentVoiceStartError(failure);
      expect(copy.kind).toBe("unavailable");
      expect(copy.message).toBe(VOICE_UNAVAILABLE);
      expect(copy.hint).toBe(VOICE_UNAVAILABLE_HINT);
      expect(voiceStatusHint("error", copy, statusHints)).toBe(VOICE_UNAVAILABLE_HINT);
      expect(voiceStatusHint("error", copy, statusHints)).not.toBe(statusHints.error);
    }
  });

  it("uses the status hint when the call has not failed", () => {
    expect(voiceStatusHint("listening", null, statusHints)).toBe("listening hint");
  });
});
