"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { SocialLinks } from "./social-links";
import { AISmartHighlight } from "./ai-smart-highlight";

import cvdata from '@/data/cvdata.json'

export function Hero() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    }));
    setParticles(newParticles);
  }, []);

  const scrollToAbout = () => {
    document
      .querySelector("#about")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/10 rounded-full"
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col lg:flex-row gap-8 items-center justify-items-center min-h-[80vh]"
        >
          {/* Left side - Textual content */}
          <motion.div
            className="flex-1 text-center lg:text-center space-y-6"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Hello, I'm
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight"
              style={{
                fontSize: 'clamp(2.25rem, 8vw, 6rem)' // Responsive text: min 2.25rem (36px), scales with viewport, max 6rem (96px)
              }}
            >
              <a href="https://gitroll.io/profile/uQUk8uoBUTNOWCHltHi810sXytq33" target="_blank" rel="nofollow noreferrer noopnener">{cvdata.name}</a>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-2"
            >
              <p className="text-2xl md:text-3xl text-muted-foreground">
                Senior Software Engineer
              </p>
              <p className="text-lg text-muted-foreground">
               <AISmartHighlight priority="balanced">
                 {cvdata.one_liner}
               </AISmartHighlight>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center lg:justify-center gap-4 flex-wrap">
                <button
                  onClick={() => scrollToAbout()}
                  className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
                >
                  View My Work
                </button>

                <a href="/cv/view" target="_blank" rel="nofollow noreferrer noopnener" className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                  View CV
                </a>

                {/* <Link
                  href="/ama"
                  className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
                >
                  🤖 Ask AI
                </Link> */}
              </div>

             <SocialLinks />
            </motion.div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="flex-shrink-0" // Prevent image from shrinking
          >
            <div className="w-0 h-0 md:w-96 md:h-96 xl:w-[30rem] xl:h-[30rem] rounded-full overflow-hidden shadow-2xl border-4 border-primary/10 relative">
              <a title="GitRoll Curism for https://github.com/p10ns11y" href="https://gitroll.io/profile/uQUk8uoBUTNOWCHltHi810sXytq33" target="_blank" rel="nofollow noreferrer noopnener" className="block w-full h-full relative">
                <Image
                  src="/images/curism.png"
                  alt="GitRoll CURISM (Contribution, Uniqueness, Reliability, Influence, Security, Maintainability) for https://github.com/p10ns11y"
                  fill
                  className="object-cover"
                />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="text-sm">Scroll down</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}
