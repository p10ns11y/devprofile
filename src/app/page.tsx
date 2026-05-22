"use client";

import { motion } from "motion/react";
import React, { Suspense } from "react";
import { About } from "@/components/about";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

const CurrentProjects = React.lazy(() =>
  import("@/components/projects").then((mod) => ({ default: mod.Projects }))
);

import { Accomplishments } from "@/components/accomplishments";
import { Contact } from "@/components/contact";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-surface1 text-text1 overflow-hidden"
    >
      <Header />

      <main>
        <Hero />
        <About />
        {/* <Skills /> */}
        <Suspense fallback={<div className="py-20 text-center">Loading projects...</div>}>
          <CurrentProjects />
        </Suspense>
        <Accomplishments />
        <Experience />
        <Contact />
      </main>

      <Footer />
    </motion.div>
  );
}
