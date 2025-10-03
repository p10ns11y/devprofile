"use client";

import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

import cvdata from '@/data/cvdata.json';

export function Accomplishments() {
  const renderCourseCard = (course: { name: string; url: string }, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
      }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <a
        href={course.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full p-6 rounded-xl border-2 border-border bg-surface3 rad-shadow hover:shadow-xl hover:border-brand/20 transition-all duration-300 cursor-pointer"
      >
        <div className="flex flex-col justify-between h-full">
          <div className="flex-1">
            <motion.h4
              whileHover={{ color: "var(--color-brand)" }}
              className="font-semibold text-lg leading-tight mb-3 text-text1 transition-colors"
            >
              {course.name}
            </motion.h4>
            <div className="flex items-center text-text2 hover:text-brand transition-colors">
              <ExternalLink className="w-4 h-4 mr-2" />
              <span className="text-sm">View Certificate</span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );

  return (
    <section id="accomplishments" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-text1">
              Accomplishments
            </h3>
            <p className="text-text2 max-w-2xl mx-auto">
              Professional certifications and course completions in technology, cloud platforms, and AI
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {cvdata.courses.map((course, index) => renderCourseCard(course, index))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
