import suggested from "@/data/suggested-qa-questions.json";

export type SuggestedQuestionCategory = "Vision" | "Agents" | "Proof" | "Leverage" | "Judgment";

export interface SuggestedQuestion {
  id: string;
  category: SuggestedQuestionCategory | string;
  /** Short rail label — keeps tracks scannable without reading full interview text. */
  label: string;
  question: string;
}

const CATEGORY_ORDER: string[] = ["Vision", "Agents", "Proof", "Leverage", "Judgment"];

function normalizeEntry(
  entry: string | (Partial<SuggestedQuestion> & { question: string })
): SuggestedQuestion {
  if (typeof entry === "string") {
    return {
      id: entry.slice(0, 48),
      category: "Proof",
      label: entry.length > 42 ? `${entry.slice(0, 40)}…` : entry,
      question: entry,
    };
  }
  const question = entry.question;
  return {
    id: entry.id || question.slice(0, 48),
    category: entry.category || "Proof",
    label: entry.label || (question.length > 42 ? `${question.slice(0, 40)}…` : question),
    question,
  };
}

export function getSuggestedQuestionEntries(): SuggestedQuestion[] {
  return (suggested as Array<string | SuggestedQuestion>).map(normalizeEntry);
}

export function getSuggestedQuestions(): string[] {
  return getSuggestedQuestionEntries().map((e) => e.question);
}

export function getSuggestedQuestionsByCategory(): Array<{
  category: string;
  items: SuggestedQuestion[];
}> {
  const entries = getSuggestedQuestionEntries();
  const map = new Map<string, SuggestedQuestion[]>();
  for (const e of entries) {
    const list = map.get(e.category) ?? [];
    list.push(e);
    map.set(e.category, list);
  }
  const known = CATEGORY_ORDER.filter((c) => map.has(c)).map((category) => ({
    category,
    items: map.get(category)!,
  }));
  const extras = [...map.keys()]
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .map((category) => ({ category, items: map.get(category)! }));
  return [...known, ...extras];
}
