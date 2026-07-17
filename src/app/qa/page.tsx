"use client";

import { motion, useReducedMotion } from "motion/react";
import { Header } from "@/components/header";
import ProfileQA from "@/components/profile-qa";

/**
 * Q&A product moment: fixed-height interview desk.
 * Answer stays in the primary viewport — tracks are a rail, not a wall above the result.
 * Footer intentionally omitted so the stage can own the viewport (distill + layout).
 */
export default function ProfileQAPage() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-dvh flex-col overflow-hidden bg-surface1 text-text1"
    >
      <Header />

      <main className="flex min-h-0 flex-1 flex-col pt-[5.25rem]">
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 sm:px-5 lg:px-6">
          <header className="shrink-0 border-b border-border/25 py-3 sm:py-3.5">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <div className="min-w-0">
                <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.5vw,2rem)] leading-tight tracking-[-0.03em] text-text1">
                  Live interview
                </h1>
                <p className="mt-0.5 text-sm text-text2">
                  First-person · grounded · SpaceXAI-depth tracks
                </p>
              </div>
              <p className="hidden text-xs text-text2 sm:block">
                Pick a track or type — answer stays here
              </p>
            </div>
          </header>

          <div className="min-h-0 flex-1 py-3 sm:py-4">
            <ProfileQA className="h-full min-h-0" />
          </div>
        </div>
      </main>
    </motion.div>
  );
}
