/**
 * Quick check that OLLAMA_BASE_URL routing works (no test runner required).
 * Usage: OLLAMA_BASE_URL=http://127.0.0.1:11434 node scripts/verify-qa-router.mjs
 */

const NARRATIVE_QUESTION_PATTERN =
  /\b(why|how do you think|what's your view|compare|reflect|philosophy|trade-?off|biggest lesson|walk me through|tell me about)\b/i;
const NARRATIVE_MIN_WORDS = 18;
const LOW_CONFIDENCE_AVG_SIM = 0.65;

function isOllamaAvailable() {
  return Boolean(process.env.OLLAMA_BASE_URL?.trim());
}

function isNarrativeQuestion(question) {
  const wordCount = question.trim().split(/\s+/).length;
  return NARRATIVE_QUESTION_PATTERN.test(question) || wordCount > NARRATIVE_MIN_WORDS;
}

function chooseStrategy(question, context, opts) {
  if (!opts.ollamaAvailable) return "template";
  const avgSim = context.reduce((s, c) => s + c.similarity, 0) / Math.max(context.length, 1);
  if (avgSim < LOW_CONFIDENCE_AVG_SIM || isNarrativeQuestion(question)) return "ollama";
  return "template";
}

const narrative =
  "Tell me about how you think about trade-offs when designing agentic AI systems for on-device use";
const context = [{ text: "x", section: "y", similarity: 0.8 }];

const ollamaAvailable = isOllamaAvailable();
const narrativeStrategy = chooseStrategy(narrative, context, { ollamaAvailable });
const factualStrategy = chooseStrategy("What is your email?", context, { ollamaAvailable });

console.log("OLLAMA_BASE_URL:", process.env.OLLAMA_BASE_URL ?? "(unset)");
console.log("isOllamaAvailable:", ollamaAvailable);
console.log("narrative →", narrativeStrategy, narrativeStrategy === "ollama" ? "OK" : "FAIL");
console.log("factual →", factualStrategy, factualStrategy === "template" ? "OK" : "FAIL");

if (ollamaAvailable && narrativeStrategy !== "ollama") {
  process.exit(1);
}
