import { isVoiceReceiveEnabled } from "@/lib/voice/config/resolve-voice-receive";
import { searchProfileForVoice } from "@/lib/voice/profile-grounding";
import { checkVoiceRateLimit, extractClientIp } from "@/lib/voice/rate-limit";

export async function POST(request: Request) {
  if (!isVoiceReceiveEnabled()) {
    return new Response(JSON.stringify({ message: "Voice receive disabled" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip = extractClientIp(request);
  if (!checkVoiceRateLimit(`voice-search:${ip || "unknown"}`, 30, 5 * 60 * 1000)) {
    return new Response(JSON.stringify({ message: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ message: "query required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await searchProfileForVoice(query, {
      ip,
      headers: request.headers,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[voice] profile-search", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
