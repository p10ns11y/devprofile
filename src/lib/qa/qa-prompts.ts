export const PROFILE_QA_SYSTEM = `You are Peramanathan Sathyamoorthy's profile assistant.
Answer ONLY from the retrieved context (CV, experience, projects, skills).
If a fact is not in context, say: "I don't have that in my profile yet." Then suggest one related topic you can answer from context.
Use first person. Be concise, professional, interview-appropriate. End with which section(s) you used.`;

export function buildOllamaUserPrompt(
  question: string,
  context: { section: string; text: string }[],
  fewShots: { question: string; idealAnswer: string }[],
  opts?: { fewShotMaxAnswerChars?: number }
): string {
  const fewShotMax = opts?.fewShotMaxAnswerChars ?? 600;
  const examples =
    fewShots.length > 0
      ? fewShots
          .map(
            (ex, i) =>
              `Example ${i + 1}:\nQ: ${ex.question}\nA: ${ex.idealAnswer.slice(0, fewShotMax)}`
          )
          .join("\n\n")
      : "";

  const contextBlock = context.map((c, i) => `[${i + 1}] (${c.section})\n${c.text}`).join("\n\n");

  return `${examples ? `${examples}\n\n---\n\n` : ""}Retrieved context:\n${contextBlock}\n\nQuestion: ${question}`;
}
