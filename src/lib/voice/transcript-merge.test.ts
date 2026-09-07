import { describe, expect, it } from "vitest";
import { upsertTranscriptLine } from "./transcript-merge";

describe("upsertTranscriptLine", () => {
  it("appends a finalized line for a new speaker turn", () => {
    const next = upsertTranscriptLine([], "user", "Hello there", false);
    expect(next).toEqual([{ role: "user", text: "Hello there", partial: false }]);
  });

  it("merges partial deltas into one in-progress user line", () => {
    const first = upsertTranscriptLine([], "user", "Hel", true);
    const second = upsertTranscriptLine(first, "user", "lo", true);
    expect(second).toEqual([{ role: "user", text: "Hello", partial: true }]);
  });

  it("finalizes a partial line instead of appending a duplicate", () => {
    const partial = upsertTranscriptLine([], "user", "Hello", true);
    const final = upsertTranscriptLine(partial, "user", "Hello there", false);
    expect(final).toEqual([{ role: "user", text: "Hello there", partial: false }]);
  });

  it("replaces refined ASR completions that extend the previous line", () => {
    const first = upsertTranscriptLine([], "user", "Tell me about", false);
    const refined = upsertTranscriptLine(first, "user", "Tell me about your work", false);
    expect(refined).toEqual([{ role: "user", text: "Tell me about your work", partial: false }]);
  });

  it("ignores duplicate finalized assistant text", () => {
    const first = upsertTranscriptLine([], "assistant", "Same answer", false);
    const dup = upsertTranscriptLine(first, "assistant", "Same answer", false);
    expect(dup).toEqual(first);
  });
});
