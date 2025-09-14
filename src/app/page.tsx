"use client";

import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Skills } from "@/components/skills";
const CurrentProjects = React.lazy(() => import('@/components/projects').then(mod => ({ default: mod.Projects })));
import { Experience } from "@/components/experience";
// import { Timeline } from "@/components/timeline";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground overflow-hidden"
    >
      <Header />

      <main>
        <Hero />
        <About />
        <Skills />
        <Suspense fallback={<div className="py-20 text-center">Loading projects...</div>}>
          <CurrentProjects />
        </Suspense>
        <Experience />
        <Contact />
      </main>

      <Footer />
    </motion.div>
  );
}
