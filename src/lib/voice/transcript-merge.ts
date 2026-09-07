export type TranscriptLine = {
  role: "user" | "assistant";
  text: string;
  partial?: boolean;
};

/** Merge streaming ASR/TTS chunks into a single conversation line per turn. */
export function upsertTranscriptLine(
  lines: TranscriptLine[],
  role: "user" | "assistant",
  text: string,
  partial = false
): TranscriptLine[] {
  const trimmed = text.trim();
  if (!trimmed) return lines;

  const last = lines.at(-1);

  if (partial) {
    if (last?.role === role && last.partial) {
      return [...lines.slice(0, -1), { role, text: last.text + trimmed, partial: true }];
    }
    return [...lines, { role, text: trimmed, partial: true }];
  }

  if (last?.role === role && last.partial) {
    return [...lines.slice(0, -1), { role, text: trimmed, partial: false }];
  }

  if (last?.role === role && !last.partial) {
    if (last.text === trimmed) return lines;
    if (trimmed.startsWith(last.text) || last.text.startsWith(trimmed)) {
      const merged = trimmed.length >= last.text.length ? trimmed : last.text;
      return [...lines.slice(0, -1), { role, text: merged, partial: false }];
    }
  }

  return [...lines, { role, text: trimmed, partial: false }];
}
