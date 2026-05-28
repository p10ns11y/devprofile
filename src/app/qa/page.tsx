"use client";

import { motion } from "motion/react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import ProfileQA from "@/components/profile-qa";

export default function ProfileQAPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-surface1 text-text1"
    >
      <Header />

      <div className="pt-[5.25rem] pb-12">
        <section className="container mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="sr-only">Q&A</h1>
          <ProfileQA />
        </section>
      </div>

      <Footer />
    </motion.div>
  );
}
