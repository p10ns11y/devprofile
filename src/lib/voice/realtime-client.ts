import { VOICE_REALTIME_WSS } from "@/lib/voice/constants";

const SAMPLE_RATE = 24000;

export type VoiceSessionStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "thinking"
  | "error"
  | "ended";

export interface VoiceRealtimeCallbacks {
  onStatus?: (status: VoiceSessionStatus) => void;
  onTranscript?: (role: "user" | "assistant", text: string, partial?: boolean) => void;
  onError?: (message: string) => void;
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768;
  }
  return float32;
}

export class VoiceRealtimeSession {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private playbackTime = 0;
  private pendingFunctionCalls: Array<{
    name: string;
    call_id: string;
    arguments: string;
  }> = [];
  private audioPlaying = false;
  private ended = false;
  private callbacks: VoiceRealtimeCallbacks;

  constructor(callbacks: VoiceRealtimeCallbacks = {}) {
    this.callbacks = callbacks;
  }

  private setStatus(status: VoiceSessionStatus) {
    this.callbacks.onStatus?.(status);
  }

  private setError(message: string) {
    this.callbacks.onError?.(message);
    this.setStatus("error");
  }

  async start(): Promise<void> {
    if (this.ended) return;
    this.setStatus("connecting");

    const tokenRes = await fetch("/api/voice/ephemeral-token", { method: "POST" });
    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({ message: "Token request failed" }));
      throw new Error(err.message || `Token HTTP ${tokenRes.status}`);
    }
    const { value: token } = (await tokenRes.json()) as { value: string };

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(VOICE_REALTIME_WSS, [`xai-client-secret.${token}`]);
      this.ws = ws;

      ws.onopen = () => resolve();
      ws.onerror = () => reject(new Error("WebSocket connection failed"));
    });

    this.ws!.onmessage = (event) => this.handleMessage(event);
    this.ws!.onclose = () => {
      if (!this.ended) this.setStatus("ended");
    };

    this.startMicCapture();
    this.setStatus("listening");
  }

  private startMicCapture() {
    if (!this.audioContext || !this.mediaStream || !this.ws) return;

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processor = processor;

    processor.onaudioprocess = (e) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.ended) return;
      const input = e.inputBuffer.getChannelData(0);
      const base64 = float32ToPcm16Base64(input);
      this.ws.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: base64,
        })
      );
    };

    source.connect(processor);
    processor.connect(this.audioContext.destination);
  }

  private schedulePlayback(base64: string) {
    if (!this.audioContext) return;
    const float32 = base64Pcm16ToFloat32(base64);
    const buffer = this.audioContext.createBuffer(1, float32.length, SAMPLE_RATE);
    buffer.getChannelData(0).set(float32);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    const startAt = Math.max(now, this.playbackTime);
    source.start(startAt);
    this.playbackTime = startAt + buffer.duration;
    this.audioPlaying = true;

    source.onended = () => {
      if (this.audioContext && this.playbackTime <= this.audioContext.currentTime + 0.05) {
        this.audioPlaying = false;
        this.flushFunctionCallsIfReady();
      }
    };

    this.setStatus("speaking");
  }

  private async handleMessage(event: MessageEvent) {
    if (typeof event.data !== "string") return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      return;
    }

    const type = parsed.type as string;

    if (type === "response.output_audio.delta" || type === "response.audio.delta") {
      const delta = parsed.delta as string | undefined;
      if (delta) this.schedulePlayback(delta);
    }

    if (type === "conversation.item.input_audio_transcription.delta") {
      const delta = (parsed.delta as string) || "";
      if (delta) this.callbacks.onTranscript?.("user", delta, true);
    }

    if (type === "conversation.item.input_audio_transcription.completed") {
      const transcript = (parsed.transcript as string) || "";
      if (transcript) this.callbacks.onTranscript?.("user", transcript, false);
    }

    if (
      type === "response.output_audio_transcript.delta" ||
      type === "response.audio_transcript.delta"
    ) {
      const delta = (parsed.delta as string) || "";
      if (delta) this.callbacks.onTranscript?.("assistant", delta, true);
    }

    if (
      type === "response.output_audio_transcript.done" ||
      type === "response.audio_transcript.done"
    ) {
      const transcript = (parsed.transcript as string) || "";
      if (transcript) this.callbacks.onTranscript?.("assistant", transcript, false);
    }

    if (type === "response.function_call_arguments.done") {
      this.pendingFunctionCalls.push({
        name: parsed.name as string,
        call_id: parsed.call_id as string,
        arguments: parsed.arguments as string,
      });
      this.setStatus("thinking");
      this.flushFunctionCallsIfReady();
    }

    if (type === "response.done" && !this.audioPlaying && this.pendingFunctionCalls.length === 0) {
      this.setStatus("listening");
    }

    if (type === "error") {
      const err = parsed.error as { message?: string } | undefined;
      this.setError(err?.message || "Realtime error");
    }
  }

  private async flushFunctionCallsIfReady() {
    if (this.pendingFunctionCalls.length === 0 || this.audioPlaying || !this.ws) return;

    const calls = [...this.pendingFunctionCalls];
    this.pendingFunctionCalls = [];

    for (const call of calls) {
      const args = JSON.parse(call.arguments || "{}") as Record<string, unknown>;
      let output: unknown;

      if (call.name === "leave_message") {
        const res = await fetch("/api/voice/leave-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(args),
        });
        const data = await res.json().catch(() => ({}));
        output = res.ok
          ? { ok: true, id: data.id, message: "Message recorded. Peramanathan will follow up." }
          : { ok: false, error: data.message || "Could not save message" };
      } else if (call.name === "profile_search") {
        const query = String(args.query || "");
        const res = await fetch("/api/voice/profile-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        output = res.ok ? await res.json() : { answer: "Search unavailable right now." };
      } else if (call.name === "end_call") {
        output = { ok: true };
        this.end();
        return;
      } else {
        output = { ok: false, error: `Unknown tool: ${call.name}` };
      }

      this.ws.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: call.call_id,
            output: JSON.stringify(output),
          },
        })
      );
    }

    this.ws.send(JSON.stringify({ type: "response.create" }));
    this.setStatus("listening");
  }

  end() {
    this.ended = true;
    this.processor?.disconnect();
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.setStatus("ended");
  }
}
