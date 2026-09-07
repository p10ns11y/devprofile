import { isVoiceReceiveEnabled } from "@/lib/voice/config/resolve-voice-receive";
import { mintEphemeralVoiceToken } from "@/lib/voice/ephemeral-token";
import { checkVoiceRateLimit, extractClientIp } from "@/lib/voice/rate-limit";

export async function POST(request: Request) {
  if (!isVoiceReceiveEnabled()) {
    return new Response(JSON.stringify({ message: "Voice receive disabled" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip = extractClientIp(request) || "unknown";
  if (!checkVoiceRateLimit(`voice-token:${ip}`, 6, 5 * 60 * 1000)) {
    return new Response(JSON.stringify({ message: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const token = await mintEphemeralVoiceToken();
    return new Response(JSON.stringify(token), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[voice] ephemeral-token", error);
    const message = error instanceof Error ? error.message : "Token mint failed";
    const status = message.includes("not configured") ? 503 : 500;
    return new Response(JSON.stringify({ message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
