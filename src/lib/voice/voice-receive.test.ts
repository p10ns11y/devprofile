import { afterEach, describe, expect, it } from "vitest";
import {
  isVoiceReceiveEnabled,
  isVoiceReceivePublic,
  resolveProfileCollectionId,
} from "./config/resolve-voice-receive";
import { buildVoiceSessionConfig } from "./ephemeral-token";
import {
  LeaveMessageValidationError,
  persistLeaveMessage,
  validateLeaveMessageInput,
} from "./leave-message";
import { checkVoiceRateLimit, resetVoiceRateLimitForTests } from "./rate-limit";

describe("resolve-voice-receive", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("is disabled by default", () => {
    delete process.env.ENABLE_VOICE_RECEIVE;
    expect(isVoiceReceiveEnabled()).toBe(false);
  });

  it("is enabled when ENABLE_VOICE_RECEIVE=true", () => {
    process.env.ENABLE_VOICE_RECEIVE = "true";
    expect(isVoiceReceiveEnabled()).toBe(true);
  });

  it("public flag follows NEXT_PUBLIC_ENABLE_VOICE_RECEIVE", () => {
    process.env.NEXT_PUBLIC_ENABLE_VOICE_RECEIVE = "true";
    expect(isVoiceReceivePublic()).toBe(true);
  });
});

describe("buildVoiceSessionConfig", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("uses file_search when collection is set", () => {
    process.env.XAI_PROFILE_COLLECTION = "col_test";
    const session = buildVoiceSessionConfig();
    expect(session.tools[0]).toMatchObject({
      type: "file_search",
      vector_store_ids: ["col_test"],
    });
  });

  it("uses profile_search fallback without collection", () => {
    delete process.env.XAI_PROFILE_COLLECTION;
    const session = buildVoiceSessionConfig();
    expect(session.tools[0]).toMatchObject({ type: "function", name: "profile_search" });
  });
});

describe("leave_message", () => {
  it("requires name and contact", () => {
    expect(() => validateLeaveMessageInput({ topic: "hi" })).toThrow(LeaveMessageValidationError);
    expect(() =>
      validateLeaveMessageInput({ name: "Ada", topic: "role", email: "a@b.co" })
    ).not.toThrow();
  });

  it("persists with durable id", async () => {
    const record = await persistLeaveMessage({
      name: "Test Caller",
      email: "test@example.com",
      topic: "Senior role",
      urgency: "normal",
    });
    expect(record.id).toMatch(/^vm_/);
    expect(record.createdAt).toBeTruthy();
  });
});

describe("voice rate limit", () => {
  afterEach(() => {
    resetVoiceRateLimitForTests();
  });

  it("blocks after limit", () => {
    const key = "test-ip";
    expect(checkVoiceRateLimit(key, 2, 60_000)).toBe(true);
    expect(checkVoiceRateLimit(key, 2, 60_000)).toBe(true);
    expect(checkVoiceRateLimit(key, 2, 60_000)).toBe(false);
  });
});

describe("resolveProfileCollectionId", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("returns trimmed collection id", () => {
    process.env.XAI_PROFILE_COLLECTION = "  my-col  ";
    expect(resolveProfileCollectionId()).toBe("my-col");
  });
});
