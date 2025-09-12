"use client";

import { motion } from 'motion/react';
import { Header } from '../components/header';
import { Hero } from '../components/hero';
import { About } from '../components/about';
import { Skills } from '../components/skills';
import { Projects as CurrentProjects } from '../components/projects';
import { Experience } from '../components/experience';
// import { Timeline } from '../components/timeline';
import { Contact } from '../components/contact';
import { Footer } from '../components/footer';

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
        <CurrentProjects />
        <Experience />
        <Contact />
      </main>

      <Footer />
    </motion.div>
  );
}
