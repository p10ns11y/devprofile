"use client";

import { ArrowUp, ChevronDown, Loader2, MessageSquareText } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type React from "react";
import { useEffect, useId, useReducer, useRef } from "react";
import { cn } from "@/components/ui/utils";
import { getSuggestedQuestionsByCategory } from "@/lib/qa/suggested-questions";
import { fetchQaAnswer, initialQaState, type QAResult, qaReducer } from "./profile-qa-state";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export type { QAResult };

const TRACKS = getSuggestedQuestionsByCategory();

interface ProfileQAProps {
  className?: string;
}

function formatMatch(similarity: number): string {
  if (!Number.isFinite(similarity) || similarity <= 0) return "source";
  return `${(similarity * 100).toFixed(0)}%`;
}

function strategyLabel(strategy?: string): string | null {
  if (!strategy) return null;
  if (strategy === "reactor") return "Collections + Grok";
  if (strategy === "golden-match") return "Golden";
  if (strategy === "template") return "Template";
  if (strategy === "ollama") return "Local";
  return strategy;
}

export function ProfileQA({ className }: ProfileQAProps) {
  const [state, dispatch] = useReducer(qaReducer, initialQaState);
  const { question, status, result, error, activeQuestion } = state;
  const loading = status === "loading";
  const reduceMotion = useReducedMotion();
  const formId = useId();
  const statusId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLElement>(null);
  const showStrategy = process.env.NODE_ENV === "development";

  // Keep the answer stage in the eye-line after each response (mobile + any residual scroll).
  useEffect(() => {
    if (status !== "success" && status !== "error" && status !== "loading") return;
    const node = answerRef.current ?? stageRef.current;
    if (!node) return;
    // Prefer focusing the stage for SR users without jumping the whole page when already visible.
    if (status === "success" && answerRef.current) {
      answerRef.current.focus({ preventScroll: true });
    }
    node.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [status, result, error, reduceMotion]);

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
    <div
      className={cn(
        "grid min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(13.5rem,17rem)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-5",
        className
      )}
    >
      {/* ── Tracks rail: scannable labels, never full essay questions ── */}
      <aside
        className="min-h-0 lg:flex lg:flex-col"
        aria-label="Interview tracks"
      >
        <div className="mb-2 flex items-baseline justify-between gap-2 lg:mb-3">
          <h2 className="text-xs font-semibold tracking-wide text-text1 uppercase">
            Tracks
          </h2>
          <span className="text-[11px] text-text2 lg:hidden">Swipe</span>
        </div>

        {/* Mobile: one short chip row — never a multi-row question wall */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {TRACKS.flatMap(({ items }) => items).map((item) => {
            const active = activeQuestion === item.question;
            return (
              <button
                key={item.id}
                type="button"
                disabled={loading}
                title={item.question}
                onClick={() => askQuestion(item.question)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "border-brand/50 bg-[var(--color-brand-subtle)] text-text1"
                    : "border-border/35 bg-surface2 text-text2 hover:border-brand/35 hover:text-text1"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: vertical rail, own scroll if needed */}
        <nav className="hidden min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pr-1 lg:flex">
          <div className="space-y-4">
            {TRACKS.map(({ category, items }) => (
              <div key={category}>
                <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-text2 uppercase">
                  {category}
                </p>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const active = activeQuestion === item.question;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          disabled={loading}
                          title={item.question}
                          onClick={() => askQuestion(item.question)}
                          className={cn(
                            "w-full rounded-md border px-2.5 py-2 text-left text-[13px] leading-snug transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            active
                              ? "border-brand/50 bg-[var(--color-brand-subtle)] font-medium text-text1"
                              : "border-transparent bg-transparent text-text2 hover:border-border/40 hover:bg-surface2 hover:text-text1"
                          )}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* ── Answer stage: composer + result own the eye ── */}
      <section
        ref={stageRef}
        className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-surface2"
        aria-label="Question and answer"
      >
        {/* Sticky composer — one optical field (textarea + send) */}
        <form
          onSubmit={handleAsk}
          className="shrink-0 border-b border-border/25 bg-surface2 p-3 sm:p-4"
          aria-describedby={statusId}
        >
          <label htmlFor={formId} className="sr-only">
            Interview question
          </label>
          <div className="relative rounded-xl border border-border/40 bg-surface1 shadow-[inset_0_1px_0_color-mix(in_oklch,var(--brand)_6%,transparent)] focus-within:border-brand/45 focus-within:ring-2 focus-within:ring-brand/25">
            <textarea
              id={formId}
              value={question}
              onChange={(e) => dispatch({ type: "SET_QUESTION", question: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading && question.trim()) {
                    void submitQuestion(question, "SUBMIT_START");
                  }
                }
              }}
              placeholder="Ask, or pick a track…"
              rows={4}
              disabled={loading}
              // biome-ignore lint/a11y/noAutofocus: primary task on this route
              autoFocus
              className={cn(
                "min-h-[7rem] max-h-48 w-full resize-y bg-transparent",
                "px-3.5 py-3 pr-14",
                "text-[15px] leading-relaxed text-text1",
                "placeholder:text-text2/90",
                "focus-visible:outline-none",
                "disabled:opacity-60"
              )}
            />
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              size="icon"
              className={cn(
                "absolute right-2.5 bottom-2.5 size-10 rounded-lg",
                "bg-brand text-[var(--color-accent-primary-text)]",
                "hover:bg-[var(--brand-hover)]",
                "disabled:opacity-40"
              )}
              aria-label={loading ? "Searching" : "Ask question"}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ArrowUp className="size-4" aria-hidden />
              )}
            </Button>
          </div>
          <p id={statusId} className="mt-2 text-[11px] leading-none text-text2">
            Enter send · Shift+Enter newline
          </p>
        </form>

        {/* Scrollable pane: ONLY the answer/empty/loading/error lives here */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait">
            {status === "error" && error && (
              <motion.div
                key="error"
                role="alert"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="m-3 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 sm:m-4"
              >
                <p className="text-sm text-red-900 dark:text-red-100">
                  Couldn’t answer that just now. {error}
                </p>
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div
                key="loading"
                role="status"
                aria-live="polite"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="flex items-start gap-3 p-5 sm:p-6"
              >
                <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-brand" aria-hidden />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-text1">Grounding in profile sources…</p>
                  {activeQuestion && (
                    <p className="text-sm text-text2 line-clamp-3">“{activeQuestion}”</p>
                  )}
                </div>
              </motion.div>
            )}

            {status === "idle" && (
              <motion.div
                key="empty"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[12rem] flex-col items-center justify-center px-6 py-10 text-center"
              >
                <MessageSquareText className="mb-3 size-7 text-text2/70" aria-hidden />
                <p className="max-w-sm text-sm leading-relaxed text-text2">
                  Choose a track on the left—or type above. The answer appears here; no scrolling
                  past a wall of questions.
                </p>
                <p className="mt-4 max-w-xs text-xs text-text2/90">
                  Strong default:{" "}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => askQuestion(TRACKS[0]?.items[0]?.question ?? "")}
                    className="font-medium text-brand underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    {TRACKS[0]?.items[0]?.label ?? "EEaaS thesis"}
                  </button>
                </p>
              </motion.div>
            )}

            {status === "success" && result && (
              <motion.article
                key="result"
                ref={answerRef}
                tabIndex={-1}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="outline-none"
              >
                <header className="flex flex-wrap items-center gap-2 border-b border-border/20 px-4 py-2.5 sm:px-5">
                  <h2 className="text-sm font-semibold text-text1">Answer</h2>
                  <div className="flex flex-wrap items-center gap-1.5" role="status">
                    {result.isGolden ? (
                      <Badge
                        variant="outline"
                        className="border-brand/45 bg-[var(--color-brand-subtle)] text-[11px] font-medium tracking-wide text-brand uppercase"
                      >
                        Curated
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border/50 bg-surface1 text-[11px] font-medium text-text2"
                      >
                        Live
                      </Badge>
                    )}
                    {showStrategy && strategyLabel(result.strategy) && (
                      <Badge
                        variant="outline"
                        className="border-border/40 bg-transparent font-mono text-[10px] font-normal tracking-normal text-text2 normal-case"
                        title="Generation path (dev)"
                      >
                        {strategyLabel(result.strategy)}
                      </Badge>
                    )}
                  </div>
                </header>

                <div
                  className="max-w-prose px-4 py-5 text-[15px] leading-[1.65] whitespace-pre-wrap text-text1 sm:px-5 sm:text-base"
                  style={{ textWrap: "pretty" }}
                >
                  {result.answer || (
                    <span className="text-text2 italic">
                      No narrative returned—try another track.
                    </span>
                  )}
                </div>

                {(result.details?.length ?? 0) > 0 && (
                  <details className="group border-t border-border/20">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-text1 sm:px-5 [&::-webkit-details-marker]:hidden">
                      <ChevronDown
                        className="size-4 shrink-0 text-text2 transition-transform group-open:rotate-180"
                        aria-hidden
                      />
                      Evidence
                      <span className="font-normal text-text2">
                        ({result.details.length})
                      </span>
                    </summary>
                    <ol className="space-y-2 px-4 pb-5 sm:px-5">
                      {result.details.map((detail, index) => (
                        <li
                          key={`${detail.section}-${index}`}
                          className="rounded-lg border border-border/30 bg-surface1 px-3 py-2.5"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold tracking-wide text-brand uppercase">
                              {detail.section}
                            </span>
                            <span className="text-[11px] tabular-nums text-text2">
                              {formatMatch(detail.similarity)}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-text2 sm:text-sm">
                            {detail.text}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default ProfileQA;
