"use client";

import { motion } from 'motion/react';

import { Badge } from './ui/badge';

import cvdata from '../data/cvdata.json'



export function Projects() {

  return (
    <section id="experience" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 pt-16 border-t border-border"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Featured Projects (2025)
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Key open-source projects showcasing technical
              expertise and innovation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-8">
            {cvdata.hobby_oss_projects.map((project, index) => (
              <motion.div
                key={project.id}
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
                  href={project.url}
                  target="_blank"
                  rel="nofollow noreferrer noopener"
                  className="block h-full overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20 cursor-pointer"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-primary/90 text-primary-foreground text-xs font-medium">
                        {project.impact}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <motion.h4
                      whileHover={{ color: "var(--primary)" }}
                      className="font-semibold text-lg leading-tight transition-colors group-hover:text-primary"
                    >
                      {project.title}
                    </motion.h4>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.technologies
                        .map((tech, techIndex) => (
                          <motion.div
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{
                              opacity: 1,
                              scale: 1,
                            }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.3,
                              delay: techIndex * 0.05,
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Badge
                              variant="secondary"
                              className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                            >
                              {tech}
                            </Badge>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
