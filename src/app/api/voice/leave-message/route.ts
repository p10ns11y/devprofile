import { isVoiceReceiveEnabled } from "@/lib/voice/config/resolve-voice-receive";
import {
  LeaveMessageValidationError,
  persistLeaveMessage,
  validateLeaveMessageInput,
} from "@/lib/voice/leave-message";
import { checkVoiceRateLimit, extractClientIp } from "@/lib/voice/rate-limit";

export async function POST(request: Request) {
  if (!isVoiceReceiveEnabled()) {
    return new Response(JSON.stringify({ message: "Voice receive disabled" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip = extractClientIp(request);
  if (!checkVoiceRateLimit(`voice-leave:${ip || "unknown"}`, 10, 60 * 60 * 1000)) {
    return new Response(JSON.stringify({ message: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const input = validateLeaveMessageInput(body);
    const record = await persistLeaveMessage(input, { ip });

    return new Response(JSON.stringify({ id: record.id, createdAt: record.createdAt }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof LeaveMessageValidationError) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("[voice] leave-message", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
