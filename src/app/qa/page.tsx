"use client";

import { MessageSquareText, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import ProfileQA from "@/components/profile-qa";
import cvdata from "@/data/cvdata.json";

export default function ProfileQAPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-surface1 text-text1"
    >
      <Header />

      <div className="pt-24 pb-16">
        <section className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-12 max-w-3xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-brand/20 bg-surface2 p-4 rad-shadow"
              >
                <MessageSquareText className="size-10 text-brand" aria-hidden />
              </motion.div>
            </div>

            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Profile Q&amp;A</h1>
            <div className="mx-auto mb-6 h-1 w-20 bg-brand opacity-60" />

            <p className="text-lg leading-relaxed text-text2">
              Ask interview-style questions about {cvdata.name.split(" ")[0]}&apos;s experience,
              projects, and tooling. Answers are grounded in CV data and curated profile notes —
              powered by xAI Grok and Collections, with a local hybrid fallback.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-text2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-surface2 px-3 py-1">
                <Sparkles className="size-3.5 text-brand" aria-hidden />
                xAI Grok + Collections
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-surface2 px-3 py-1">
                Hybrid retrieval fallback
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-surface2 px-3 py-1">
                Optional Ollama
              </span>
            </motion.div>
          </motion.div>

          <ProfileQA className="mx-auto max-w-4xl" />
        </section>
      </div>

      <Footer />
    </motion.div>
  );
}
