"use client";

import { Loader2, MessageSquareText, Search, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useReducer } from "react";
import { getSuggestedQuestions } from "@/lib/qa/suggested-questions";
import { fetchQaAnswer, initialQaState, type QAResult, qaReducer } from "./profile-qa-state";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export type { QAResult };

const SUGGESTED_QUESTIONS = getSuggestedQuestions();

interface ProfileQAProps {
  className?: string;
}

export function ProfileQA({ className }: ProfileQAProps) {
  const [state, dispatch] = useReducer(qaReducer, initialQaState);
  const { question, status, result, error, activeQuestion } = state;
  const loading = status === "loading";

  const showStrategy = process.env.NODE_ENV === "development";

  const submitQuestion = async (
    q: string,
    startAction: "SUBMIT_START" | "SELECT_SUGGESTED_QUESTION"
  ) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    dispatch({ type: startAction, question: trimmed });

    try {
      const data = await fetchQaAnswer(trimmed);
      dispatch({ type: "SUBMIT_SUCCESS", result: data });
    } catch (err) {
      dispatch({
        type: "SUBMIT_ERROR",
        error: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const askQuestion = (q: string) => submitQuestion(q, "SELECT_SUGGESTED_QUESTION");

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuestion(question, "SUBMIT_START");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={className}
    >
      <Card className="rad-shadow border-border/30 bg-surface2/80 backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold text-text1">Ask a question</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-text1">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  onClick={() => askQuestion(suggestion)}
                  className={`rounded-full border px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    activeQuestion === suggestion
                      ? "border-brand/60 bg-brand/10 text-text1"
                      : "border-border/40 bg-surface1 text-text1 hover:border-brand/40 hover:bg-surface3"
                  }`}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAsk} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="profile-qa-question" className="text-sm font-medium text-text1">
                Your question
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text2" />
                <Input
                  id="profile-qa-question"
                  type="text"
                  value={question}
                  onChange={(e) => dispatch({ type: "SET_QUESTION", question: e.target.value })}
                  placeholder="e.g., What is your experience with React and TypeScript?"
                  className="bg-surface1 pl-9"
                  disabled={loading}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-brand text-text1 hover:bg-brand/90"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Thinking…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Ask
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {status === "error" && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 rounded-xl border border-red-300/40 bg-red-50/80 p-4 dark:border-red-800/40 dark:bg-red-950/30"
          >
            <p className="text-sm text-red-800 dark:text-red-200">Error: {error}</p>
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <Card className="rad-shadow border-border/30 bg-surface2/80">
              <CardContent className="flex items-center gap-3 py-8">
                <Loader2 className="size-5 animate-spin text-brand" />
                <div className="space-y-1">
                  <p className="font-medium text-text1">Searching profile sources…</p>
                  <p className="text-sm text-text2">
                    {activeQuestion ? `"${activeQuestion}"` : "Preparing your answer"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {status === "idle" && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-xl border border-dashed border-border/50 bg-surface2/40 px-6 py-10 text-center"
          >
            <MessageSquareText className="mx-auto mb-3 size-8 text-text2/60" aria-hidden />
            <p className="text-text2">
              Pick a suggested question or type your own to see an answer with retrieved sources.
            </p>
          </motion.div>
        )}

        {status === "success" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <Card className="rad-shadow border-border/30 bg-surface2/80 overflow-hidden">
              <CardHeader className="border-b border-border/20 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg text-text1">Answer</CardTitle>
                  {showStrategy && result.strategy && (
                    <Badge variant="outline" className="font-mono text-xs">
                      strategy: {result.strategy}
                    </Badge>
                  )}
                  {showStrategy && result.ollamaError && (
                    <Badge
                      variant="outline"
                      className="border-amber-400/50 bg-amber-50 font-mono text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                    >
                      ollama: {result.ollamaError}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap text-text1">
                  {result.answer || (
                    <span className="text-text2 italic">
                      No narrative answer returned — check retrieved sources below or Ollama config.
                    </span>
                  )}
                </p>

                {(result.details?.length ?? 0) > 0 && (
                  <div className="space-y-4 border-t border-border/20 pt-6">
                    <h4 className="font-medium text-text1">Retrieved information</h4>
                    <div className="space-y-3">
                      {result.details.map((detail, index) => (
                        <motion.div
                          key={`${detail.section}-${index}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-lg border border-border/30 bg-surface1 p-4"
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <span className="text-sm font-medium text-brand">{detail.section}</span>
                            <span className="shrink-0 text-xs text-text2">
                              {(detail.similarity * 100).toFixed(1)}% match
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-text2">{detail.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProfileQA;
