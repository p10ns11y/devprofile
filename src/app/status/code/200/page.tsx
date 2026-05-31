"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { GitHubLiveDashboardHost } from "@/components/github-live-dashboard-host";
import { Header } from "@/components/header";

const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "p10ns11y";

export default function Status200Page() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-surface1 text-text1"
    >
      <Header />

      <div className="pt-[5.25rem] pb-12">
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="sr-only">Live GitHub activity</h1>
          <div className="mb-6 text-center max-w-2xl mx-auto">
            <p className="text-sm font-mono text-brand mb-2">HTTP 200 OK</p>
            <h2 className="text-2xl font-semibold tracking-tight text-text1 mb-2">
              What I&apos;m shipping right now
            </h2>
            <p className="text-text2 text-sm">
              Live repos from{" "}
              <Link
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                GitHub
              </Link>
              . Auto-refreshes every 10 minutes.
            </p>
          </div>

          <div className="rounded-2xl border border-border/40 bg-surface2/50 p-4 sm:p-6">
            <GitHubLiveDashboardHost username={GITHUB_USERNAME} />
          </div>
        </section>
      </div>

      <Footer />
    </motion.div>
  );
}
