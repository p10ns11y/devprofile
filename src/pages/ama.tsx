"use client";

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AICHAT } from '../components/AICHAT';

export default function AMA() {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground overflow-hidden"
    >
      {/* <Header /> */}

      <main className="flex-1">
        <AICHAT />
      </main>
    </motion.div>
  );
}
