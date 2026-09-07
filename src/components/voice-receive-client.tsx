"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { cn } from "@/components/ui/utils";
import type { VoiceSessionStatus } from "@/lib/voice/realtime-client";
import { VoiceRealtimeSession } from "@/lib/voice/realtime-client";
import { Button } from "./ui/button";

type TranscriptLine = { role: "user" | "assistant"; text: string };

const STATUS_LABEL: Record<VoiceSessionStatus, string> = {
  idle: "Ready",
  connecting: "Connecting…",
  listening: "Listening",
  speaking: "Speaking",
  thinking: "Thinking…",
  error: "Error",
  ended: "Call ended",
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

  const appendTranscript = useCallback((role: "user" | "assistant", text: string) => {
    setTranscript((prev) => [...prev, { role, text }]);
  }, []);

  const startCall = useCallback(async () => {
    setError(null);
    setTranscript([]);
    sessionRef.current?.end();

    const session = new VoiceRealtimeSession({
      onStatus: setStatus,
      onTranscript: appendTranscript,
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
  }, [appendTranscript]);

  const endCall = useCallback(() => {
    sessionRef.current?.end();
    setStatus("ended");
  }, []);

  const inCall =
    status === "connecting" ||
    status === "listening" ||
    status === "speaking" ||
    status === "thinking";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-4", className)}>
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/30 bg-surface2/40 px-4 py-3"
        aria-live="polite"
        aria-atomic="true"
      >
        <div>
          <p className="text-sm font-medium text-text1">Voice reception</p>
          <p id={statusId} className="text-xs text-text2">
            {error ? error : STATUS_LABEL[status]}
          </p>
        </div>
        <div className="flex gap-2">
          {!inCall ? (
            <Button type="button" onClick={startCall}>
              <Mic className="size-4" aria-hidden="true" />
              Start call
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={endCall}>
              <PhoneOff className="size-4" aria-hidden="true" />
              End call
            </Button>
          )}
        </div>
      </div>

      <section
        aria-labelledby={transcriptId}
        className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border/25 bg-surface1 p-4"
      >
        <h2 id={transcriptId} className="sr-only">
          Conversation transcript
        </h2>
        {transcript.length === 0 ? (
          <p className="text-sm text-text2">
            Ask about experience, projects, or skills — same corpus as text Q&amp;A. Say you want to
            leave a message if you need a direct follow-up.
          </p>
        ) : (
          <ul className="flex flex-col gap-3" role="list">
            {transcript.map((line, i) => (
              <li
                key={`${line.role}-${i}`}
                className={cn(
                  "text-sm",
                  line.role === "user" ? "text-text2" : "text-text1 font-medium"
                )}
              >
                <span className="sr-only">{line.role === "user" ? "You" : "Receptionist"}:</span>
                {line.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      {status === "error" ? (
        <p className="flex items-center gap-2 text-xs text-text2">
          <MicOff className="size-3.5" aria-hidden="true" />
          Check microphone permission and that voice receive is enabled on this deployment.
        </p>
      ) : null}
    </div>
  );
}
