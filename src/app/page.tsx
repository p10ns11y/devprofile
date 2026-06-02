"use client";

import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { About } from "@/components/about";
import { Accomplishments } from "@/components/accomplishments";
import { Contact } from "@/components/contact";
import { CvModal } from "@/components/cv/cv-modal";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { motionTransition } from "@/lib/motion";

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={motionTransition(!!shouldReduceMotion, 0.5)}
      className="min-h-screen min-w-0 bg-surface1 text-text1 overflow-x-clip"
    >
      <Header />
      <Hero />
      <About />
      <Accomplishments />
      <Experience />
      <Contact />
      <Footer />
      <Suspense fallback={null}>
        <CvModal />
      </Suspense>
    </motion.div>
  );
}
