"use client";

import { motion, useReducedMotion } from "motion/react";
import cvdata from "@/data/cvdata.json";
import { fadeUp, motionTransition } from "@/lib/motion";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";
import { Badge } from "./ui/badge";

const projectsHeadingId = "projects-heading";
const ossHeadingId = "oss-heading";

type Project = (typeof cvdata.projects)[number];

function ProjectSkeleton() {
  return (
    <article
      aria-busy="true"
      className="rounded-xl border-2 border-border bg-surface3 animate-pulse h-64"
    />
  );
}

function FeaturedProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  return (
    <li className={featured ? "md:col-span-2" : undefined}>
      <article
        data-card="project"
        data-featured={featured ? "true" : undefined}
        className="h-full rounded-xl border-2 border-border bg-surface3 rad-shadow overflow-hidden transition-shadow"
      >
        <a
          href={project.url}
          target="_blank"
          rel="nofollow noreferrer noopener"
          className="grid grid-cols-1 lg:grid-cols-2 h-full min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <div className="relative overflow-hidden min-h-40 lg:min-h-full">
            <img src={project.image} alt="" className="w-full h-full object-cover min-h-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {project.impact ? (
              <span className="absolute bottom-3 left-3 inline-flex px-2 py-1 rounded-md bg-brand/90 text-accent-primary-text text-xs font-medium">
                {project.impact}
              </span>
            ) : null}
          </div>
          <div className="p-4 lg:p-6 flex flex-col justify-between gap-4 min-w-0">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-text1 group-hover:text-brand">
                {project.name ?? (project as Project & { title?: string }).title}
              </h3>
              <p className="text-text2 text-sm leading-relaxed line-clamp-3">
                {project.description}
              </p>
            </div>
            {project.technologies?.length ? (
              <ul role="list" className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <li key={tech}>
                    <Badge variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </a>
      </article>
    </li>
  );
}

function OssProjectRow({ project }: { project: Project }) {
  return (
    <li>
      <article
        data-card="project"
        className="rounded-lg border border-border bg-surface2 p-4 hover:border-brand/20 transition-colors"
      >
        <a
          href={project.url}
          target="_blank"
          rel="nofollow noreferrer noopener"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <h3 className="font-medium text-text1">
            {project.name ?? (project as Project & { title?: string }).title}
          </h3>
          <p className="text-sm text-text2 line-clamp-1">{project.description}</p>
        </a>
      </article>
    </li>
  );
}

function MoreProjectRow({ project }: { project: Project }) {
  return (
    <li>
      <article
        data-card="project"
        className="rounded-lg border border-border bg-surface2 p-4 hover:border-brand/20 transition-colors"
      >
        <a
          href={project.url}
          target="_blank"
          rel="nofollow noreferrer noopener"
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <h3 className="font-medium text-text1 shrink-0">
            {project.name ?? (project as Project & { title?: string }).title}
          </h3>
          <p className="text-sm text-text2 line-clamp-2 sm:text-right">{project.description}</p>
        </a>
      </article>
    </li>
  );
}

export function Projects() {
  const shouldReduceMotion = useReducedMotion();
  const nonOssProjects = cvdata.projects.filter((project) => project.type !== "oss_contribution");
  const featuredProjects = nonOssProjects.slice(0, 3);
  const moreProjects = nonOssProjects.slice(3);
  const ossContributions = cvdata.projects.filter((project) => project.type === "oss_contribution");

  return (
    <SectionShell id="projects" headingId={projectsHeadingId}>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={motionTransition(!!shouldReduceMotion)}
      >
        <SectionHeading
          id={projectsHeadingId}
          eyebrow="Portfolio"
          title="Featured Projects"
          description="Personal and professional work showcasing technical depth and product impact."
        />

        <ul role="list" className="projects-bento grid min-w-0 md:grid-cols-2 gap-6">
          {featuredProjects.length === 0
            ? Array.from({ length: 3 }, (_, i) => <ProjectSkeleton key={i} />)
            : featuredProjects.map((project, index) => (
                <FeaturedProjectCard
                  key={project.id ?? project.name}
                  project={project}
                  featured={index === 0}
                />
              ))}
        </ul>

        {moreProjects.length > 0 ? (
          <div className="mt-12 pt-10 border-t border-border">
            <h3 className="text-lg font-semibold text-text1 mb-4">More projects</h3>
            <ul role="list" className="space-y-3">
              {moreProjects.map((project) => (
                <MoreProjectRow key={project.id ?? project.name} project={project} />
              ))}
            </ul>
          </div>
        ) : null}

        {ossContributions.length > 0 ? (
          <div className="mt-16 pt-12 border-t border-border">
            <SectionHeading
              id={ossHeadingId}
              title="Open Source Contributions"
              description="Community contributions and collaborative open-source work."
              className="mb-8"
            />
            <ul role="list" className="space-y-3">
              {ossContributions.map((project) => (
                <OssProjectRow key={project.id ?? project.name} project={project} />
              ))}
            </ul>
          </div>
        ) : null}
      </motion.div>
    </SectionShell>
  );
}

export function ProjectsFallback() {
  return (
    <SectionShell id="projects" headingId={projectsHeadingId}>
      <SectionHeading id={projectsHeadingId} title="Featured Projects" />
      <div className="grid md:grid-cols-2 gap-6">
        <ProjectSkeleton />
        <ProjectSkeleton />
        <ProjectSkeleton />
      </div>
    </SectionShell>
  );
}
