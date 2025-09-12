"use client";

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { AICHAT } from '../components/ai-chat';
import { getFeatureDisclaimer, isFeatureInDevelopment } from '../config/feature-flags';
import { AlertTriangle } from 'lucide-react';

export default function AMA() {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  let amaDisclaimer;
  const isAmaInDevelopment = isFeatureInDevelopment('ama');
  
  if (isAmaInDevelopment) {
    amaDisclaimer = getFeatureDisclaimer('ama');
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground overflow-hidden"
    >
      {/* <Header /> */}

      {/* Development Disclaimer */}
      {isAmaInDevelopment && amaDisclaimer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-4 mx-4 mt-4 rounded-r-lg"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Development Feature</p>
              <p>{amaDisclaimer}</p>
            </div>
          </div>
        </motion.div>
      )}

      <main className="flex-1">
        <AICHAT />
      </main>
    </motion.div>
  );
}
