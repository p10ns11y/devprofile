"use client";

import { motion } from "motion/react";
import { Calendar, MapPin, Users, Code } from "lucide-react";
import { Badge } from "./ui/badge";
import { TimelineContent } from './timeline';
import { AISmartHighlight } from './ai-smart-highlight';

import cvdata from '../data/cvdata.json'

export function Experience() {
  return (
    <section id="experience" className="py-20 bg-surface2">
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
          <div className="w-20 h-1 bg-brand mx-auto mb-8"></div>
          {/* <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <AISmartHighlight priority="balanced">
              {cvdata.profile}
            </AISmartHighlight>
          </p> */}
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
              <div className="bg-surface3/50 backdrop-blur-sm rounded-2xl p-8 border border-surface4/30 rad-shadow hover:shadow-xl transition-all duration-300 hover:border-brand/30">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                  <div className="lg:w-1/3 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center"
                      >
                        <Users className="w-6 h-6 text-brand" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-text1">
                          {experience.title}
                        </h3>
                        <span className="text-sm text-text2">
                          {experience.company}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-text2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {experience.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {experience.start_date} -{" "}
                        {experience.end_date}
                      </div>
                      <div className="bg-surface3 text-text1 px-2 py-1 rounded-md font-medium">
                        {experience.duration}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-2/3 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-text1 mb-4 flex items-center gap-2">
                        <Code className="w-4 h-4 text-brand" />
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
                              className="text-text1 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brand before:font-bold"
                            >
                              <AISmartHighlight priority="balanced">
                                {responsibility}
                              </AISmartHighlight>
                            </motion.li>
                          ),
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-text1 mb-3">
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
                                className="hover:bg-brand hover:text-text1 transition-colors duration-300"
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
