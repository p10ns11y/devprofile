'use client';

import { motion } from 'motion/react';
import cvdata from '../data/cvdata.json'

export function TimelineContent() {
  return (
    <div className="flex justify-center py-5">
      <div className="text-center text-sm text-muted-foreground max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cvdata.work_experience.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="bg-card/50 rounded-lg p-3 text-xs"
            >
              <div className="font-semibold text-foreground mb-1">
                {exp.start_date.split(" ")[1]}
              </div>
              <div className="text-muted-foreground">
                {exp.title}
              </div>
              <div className="text-primary font-medium">
                {exp.company.split(",")[0]}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}


export function Timeline() {
  return (
    <section id="Timeline" className='py-20'>
      <div className='container mx-auto px-6'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 pt-16 border-t border-border"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Career Timeline
          </h3>
          <TimelineContent />
        </motion.div>
      </div>
    </section>
  )
}