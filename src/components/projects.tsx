"use client";

import { motion } from 'motion/react';

import { Badge } from './ui/badge';

import cvdata from '@/data/cvdata.json'

export function Projects() {
  // Filter projects by type
  const featuredProjects = cvdata.projects.filter(project => project.type !== 'oss_contribution');
  const ossContributions = cvdata.projects.filter(project => project.type === 'oss_contribution');

  const renderProjectCard = (project: any, index: number, isOssContribution = false) => (
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
        className={`block h-full overflow-hidden rounded-xl border-2 ${
          isOssContribution
            ? 'border-border bg-surface2 rad-shadow hover:border-surface4'
            : 'border-border bg-surface3 rad-shadow hover:shadow-xl hover:border-brand/20'
        } transition-all duration-300 cursor-pointer`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Image Column */}
          <div className="relative overflow-hidden lg:h-full">
            <img
              src={project.image}
              alt={project.name || (project as any).title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 grayscale group-hover:grayscale-66"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 space-y-2">
              {/* Impact Badge */}
              <div className={`inline-flex items-center px-2 py-1 rounded-md bg-white/90 text-text1 text-xs font-medium`}>
                {project.impact || 'Contribution'}
              </div>

              {/* Company Badge - Only show if available */}
              {project.meta?.company && (
                <div className="inline-flex items-center px-2 py-1 rounded-md bg-white/90 text-text1 text-xs font-medium">
                  {project.meta.company}
                </div>
              )}
            </div>
          </div>

          {/* Text Content Column */}
          <div className={`p-4 lg:p-6 flex flex-col justify-between min-h-[140px] lg:min-h-full ${
            isOssContribution ? 'text-text1' : ''
          }`}>
            <div className="space-y-3">
              <motion.h4
                whileHover={{ color: "var(--color-brand)" }}
                className={`font-semibold text-base lg:text-lg leading-tight transition-colors line-clamp-2 group-hover:text-text1`}
              >
                {project.name || (project as any).title}
              </motion.h4>

              <p className={`text-text2 text-xs lg:text-sm leading-relaxed line-clamp-2 ${
                isOssContribution ? 'text-text2' : ''
              }`}>
                {project.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-4">
              {project.technologies
                ?.map((tech: string, techIndex: number) => (
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
                      delay: techIndex * 0.03,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge
                      variant="secondary"
                      className={`text-xs hover:bg-brand hover:text-text1 transition-colors duration-300 ${
                        isOssContribution ? 'hover:bg-surface4 hover:text-text1' : ''
                      }`}
                    >
                      {tech}
                    </Badge>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-6">
        {/* Featured Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-text1">
              Featured Projects
            </h3>
            <p className="text-text2 max-w-2xl mx-auto">
              Key personal and professional projects showcasing technical expertise and innovation
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {featuredProjects.map((project, index) => renderProjectCard(project, index))}
          </div>
        </motion.div>

        {/* OSS Contributions Section */}
        {ossContributions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 pt-16"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4 text-text2">
                Open Source Contributions
              </h3>
              <p className="text-text2 max-w-2xl mx-auto">
                Community contributions and collaborative work on open-source projects
              </p>
            </div>

            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
              {ossContributions.map((project, index) => renderProjectCard(project, index, true))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
