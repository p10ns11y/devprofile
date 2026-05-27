import suggested from "@/data/suggested-qa-questions.json";

/** Chip questions from casual + golden corpus (see suggested-qa-questions.json). */
export function getSuggestedQuestions(): string[] {
  return [...suggested];
}
