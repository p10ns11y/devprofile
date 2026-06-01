import { describe, expect, it } from "vitest";
import {
  type AbuseResult,
  NO_LOCAL_VECTORS_COMMENT,
  type PersonaTool,
  type ProfilePacket,
  QA_REACTOR_FLAG,
} from "../index";

describe("Visitor JSON contracts (supports all scenarios)", () => {
  it("exports stable reactor flag and invariant comment", () => {
    expect(QA_REACTOR_FLAG).toBe("qaReactor");
    expect(NO_LOCAL_VECTORS_COMMENT).toMatch(/xAI Collections is the sole substrate/);
  });

  it("ProfilePacket and AbuseResult shapes compile", () => {
    const packet: ProfilePacket = {
      version: "v1-2026-05",
      compiledAt: new Date().toISOString(),
      coreIdentity: "Test",
      principles: [],
      topAchievements: [],
      experienceHighlights: [],
      signatureProjects: [],
      goldenExamples: [{ q: "Q?", a: "A." }],
      structuredSnapshot: {},
      ingestDocument: "# Test",
      toolSystemPrompt: "You are helpful.",
    };
    const abuse: AbuseResult = {
      blocked: true,
      reason: "rate-limit",
      layer: "edge",
    };
    const tool: PersonaTool = {
      name: "testTool",
      description: "test",
      parameters: {},
      execute: async () => "ok",
    };
    expect(packet.goldenExamples).toHaveLength(1);
    expect(abuse.blocked).toBe(true);
    expect(tool.name).toBe("testTool");
  });
});
