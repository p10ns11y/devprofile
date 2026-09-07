"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Header } from "@/components/header";
import { VoiceReceiveClient } from "@/components/voice-receive-client";

interface CallPageClientProps {
  /** Server-evaluated from ENABLE_VOICE_RECEIVE — do not read that env var in this client module. */
  enabled: boolean;
}

export function CallPageClient({ enabled }: CallPageClientProps) {
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
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-3 sm:px-5 lg:px-6">
          <header className="shrink-0 border-b border-border/25 py-3 sm:py-4">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h1
                  className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.5vw,2rem)] leading-tight tracking-[-0.03em] text-text1"
                  data-lcv="must-show"
                >
                  Talk instead
                </h1>
                <p className="mt-0.5 text-sm text-text2" data-lcv="must-show">
                  Voice reception — short answers from my profile, or leave a message
                </p>
              </div>
              <Link
                href="/qa"
                className="text-sm text-link underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)"
              >
                Prefer text Q&amp;A
              </Link>
            </div>
          </header>

          <div className="min-h-0 flex-1 py-3 sm:py-4">
            {enabled ? (
              <VoiceReceiveClient className="h-full min-h-0" />
            ) : (
              <div
                className="rounded-xl border border-border/30 bg-surface2/30 p-6 text-sm text-text2"
                data-lcv="must-show"
              >
                <p className="font-medium text-text1">Voice receive is not enabled</p>
                <p className="mt-2">
                  Set <code className="text-xs">ENABLE_VOICE_RECEIVE=true</code> and configure{" "}
                  <code className="text-xs">XAI_API_KEY</code> on the server. Use{" "}
                  <Link href="/qa" className="text-link underline-offset-4 hover:underline">
                    text Q&amp;A
                  </Link>{" "}
                  in the meantime.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}
