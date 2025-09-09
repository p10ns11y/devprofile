"use client";

import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Skills } from '../components/Skills';
import { Projects as CurrentProjects } from '../components/Projects';
import { Experience } from '../components/Experience';
// import { Timeline } from '../components/Timeline';
import { Contact } from '../components/Contact';
import { Footer } from '../components/Footer';

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
