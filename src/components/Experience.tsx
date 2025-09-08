"use client";

import { motion } from "motion/react";
import { Calendar, MapPin, Users, Code } from "lucide-react";
import { Badge } from "./ui/badge";
import { TimelineContent } from './Timeline';

import cvdata from '../data/cvdata.json'

export function Experience() {
  return (
    <section id="experience" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-6">
            Professional Experience
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            9+ years of progressive experience in software
            engineering, from intern to senior engineer, with a
            proven track record of delivering scalable solutions
            and leading development teams.
          </p>
          <TimelineContent />
        </motion.div>

        <div className="space-y-12">
          {cvdata.work_experience.map((experience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                  <div className="lg:w-1/3 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
                      >
                        <Users className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {experience.title}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {experience.company}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {experience.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {experience.start_date} -{" "}
                        {experience.end_date}
                      </div>
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                        {experience.duration}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-2/3 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary" />
                        Key Achievements
                      </h4>
                      <ul className="space-y-3">
                        {experience.responsibilities.map(
                          (responsibility, respIndex) => (
                            <motion.li
                              key={respIndex}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.5,
                                delay: respIndex * 0.1,
                              }}
                              className="text-muted-foreground leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold"
                            >
                              {responsibility}
                            </motion.li>
                          ),
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-3">
                        Technologies & Tools
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {experience.tools.map(
                          (tool, toolIndex) => (
                            <motion.div
                              key={toolIndex}
                              initial={{
                                opacity: 0,
                                scale: 0.8,
                              }}
                              whileInView={{
                                opacity: 1,
                                scale: 1,
                              }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.3,
                                delay: toolIndex * 0.05,
                              }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Badge
                                variant="outline"
                                className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                              >
                                {tool}
                              </Badge>
                            </motion.div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
