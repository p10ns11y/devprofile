"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { cn } from "@/components/ui/utils";
import type { VoiceSessionStatus } from "@/lib/voice/realtime-client";
import { VoiceRealtimeSession } from "@/lib/voice/realtime-client";
import type { TranscriptLine } from "@/lib/voice/transcript-merge";
import { upsertTranscriptLine } from "@/lib/voice/transcript-merge";

const STATUS_LABEL: Record<VoiceSessionStatus, string> = {
  idle: "Ready",
  connecting: "Connecting",
  listening: "Listening",
  speaking: "Speaking",
  thinking: "One moment",
  error: "Something went wrong",
  ended: "Call ended",
};

const STATUS_HINT: Record<VoiceSessionStatus, string> = {
  idle: "Ask about experience, projects, or skills — same corpus as text Q&A.",
  connecting: "Setting up microphone and voice session.",
  listening: "Speak naturally. Say you want to leave a message for a direct follow-up.",
  speaking: "Playing the receptionist reply.",
  thinking: "Looking up an answer from the profile.",
  error: "Check microphone permission and that voice receive is enabled on this deployment.",
  ended: "Start another call anytime, or use text Q&A.",
};

interface VoiceReceiveClientProps {
  className?: string;
}

export function VoiceReceiveClient({ className }: VoiceReceiveClientProps) {
  const [status, setStatus] = useState<VoiceSessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const sessionRef = useRef<VoiceRealtimeSession | null>(null);
  const statusId = useId();
  const transcriptId = useId();
  const transcriptBodyId = useId();

  const upsertTranscript = useCallback(
    (role: "user" | "assistant", text: string, partial = false) => {
      setTranscript((prev) => upsertTranscriptLine(prev, role, text, partial));
    },
    []
  );

  const startCall = useCallback(async () => {
    setError(null);
    setTranscript([]);
    sessionRef.current?.end();

    const session = new VoiceRealtimeSession({
      onStatus: setStatus,
      onTranscript: upsertTranscript,
      onError: (message) => setError(message),
    });
    sessionRef.current = session;

    try {
      await session.start();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start call";
      setError(message);
      setStatus("error");
    }
  }, [upsertTranscript]);

  const endCall = useCallback(() => {
    sessionRef.current?.end();
    setStatus("ended");
  }, []);

  const inCall =
    status === "connecting" ||
    status === "listening" ||
    status === "speaking" ||
    status === "thinking";

  const statusMessage = error ?? STATUS_LABEL[status];
  const hint = error ? STATUS_HINT.error : STATUS_HINT[status];

  return (
    <div className={cn("voice-receive", className)}>
      <section
        className="voice-receive__stage"
        data-status={status}
        aria-labelledby={statusId}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="voice-receive__status">
          <span className="voice-receive__status-dot" aria-hidden="true" />
          <p id={statusId}>{statusMessage}</p>
        </div>

        <div className="voice-receive__control-wrap">
          <span className="voice-receive__control-ring" aria-hidden="true" />
          {!inCall ? (
            <button
              type="button"
              className="voice-receive__control voice-receive__control--start"
              onClick={startCall}
            >
              <Mic className="size-4" aria-hidden="true" />
              {status === "ended" ? "Start again" : "Start call"}
            </button>
          ) : (
            <button
              type="button"
              className="voice-receive__control voice-receive__control--end"
              onClick={endCall}
            >
              <PhoneOff className="size-4" aria-hidden="true" />
              End call
            </button>
          )}
        </div>

        <p className="voice-receive__hint">{hint}</p>
      </section>

      <section
        className="voice-receive__transcript"
        aria-labelledby={transcriptId}
        aria-describedby={transcriptBodyId}
      >
        <h2 id={transcriptId} className="voice-receive__transcript-header">
          Conversation
        </h2>
        <div id={transcriptBodyId} className="voice-receive__transcript-body">
          {transcript.length === 0 ? (
            <p className="voice-receive__empty">
              Your side and the receptionist replies will appear here once you start talking.
            </p>
          ) : (
            <ul className="voice-receive__thread" role="list">
              {transcript.map((line, index) => (
                <li
                  key={`${line.role}-${index}`}
                  className={cn(
                    "voice-receive__bubble",
                    line.role === "user"
                      ? "voice-receive__bubble--user"
                      : "voice-receive__bubble--assistant"
                  )}
                  data-partial={line.partial ? "true" : undefined}
                >
                  <span className="voice-receive__bubble-label">
                    {line.role === "user" ? "You" : "Receptionist"}
                  </span>
                  <p className="voice-receive__bubble-text">{line.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {status === "error" ? (
        <p className="voice-receive__error">
          <MicOff className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{STATUS_HINT.error}</span>
        </p>
      ) : null}
    </div>
  );
}
