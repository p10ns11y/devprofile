import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import cvdata from "@/data/cvdata.json";
import type { LeaveMessageInput, LeaveMessageRecord, VoiceUrgency } from "./types";

const DATA_DIR = join(process.cwd(), ".data", "voice-messages");

function normalizeUrgency(value?: string): VoiceUrgency {
  if (value === "low" || value === "high") return value;
  return "normal";
}

export function validateLeaveMessageInput(body: unknown): LeaveMessageInput {
  if (!body || typeof body !== "object") {
    throw new LeaveMessageValidationError("Invalid payload");
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const topic = typeof raw.topic === "string" ? raw.topic.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : undefined;
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : undefined;
  const transcript_excerpt =
    typeof raw.transcript_excerpt === "string" ? raw.transcript_excerpt.trim() : undefined;
  const urgency = normalizeUrgency(typeof raw.urgency === "string" ? raw.urgency : undefined);

  if (!name) throw new LeaveMessageValidationError("name is required");
  if (!topic) throw new LeaveMessageValidationError("topic is required");
  if (!email && !phone) {
    throw new LeaveMessageValidationError("email or phone is required");
  }

  return {
    name,
    topic,
    email: email || undefined,
    phone: phone || undefined,
    transcript_excerpt,
    urgency,
  };
}

export class LeaveMessageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeaveMessageValidationError";
  }
}

async function appendToStore(record: LeaveMessageRecord): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const path = join(DATA_DIR, "messages.jsonl");
  await appendFile(path, `${JSON.stringify(record)}\n`, "utf8");
}

async function notifyOperator(record: LeaveMessageRecord): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyEmail = process.env.VOICE_NOTIFY_EMAIL?.trim() || cvdata.contact.email;

  if (!resendKey) {
    console.info("[voice] leave_message stored; RESEND_API_KEY unset — HITL email notify");
    return;
  }

  const body = [
    `New voice leave_message (${record.id})`,
    "",
    `Name: ${record.name}`,
    `Topic: ${record.topic}`,
    `Urgency: ${record.urgency ?? "normal"}`,
    record.email ? `Email: ${record.email}` : "",
    record.phone ? `Phone: ${record.phone}` : "",
    record.transcript_excerpt ? `\nExcerpt:\n${record.transcript_excerpt}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Voice Receive <onboarding@resend.dev>",
      to: [notifyEmail],
      subject: `[Voice] ${record.urgency === "high" ? "URGENT — " : ""}${record.topic}`,
      text: body,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[voice] Resend notify failed", response.status, detail);
  }
}

export async function persistLeaveMessage(
  input: LeaveMessageInput,
  ctx: { ip?: string } = {}
): Promise<LeaveMessageRecord> {
  const record: LeaveMessageRecord = {
    ...input,
    id: `vm_${randomUUID()}`,
    createdAt: new Date().toISOString(),
    ip: ctx.ip,
    urgency: input.urgency ?? "normal",
  };

  await appendToStore(record);
  await notifyOperator(record).catch((err) => {
    console.error("[voice] notifyOperator error", err);
  });

  return record;
}
