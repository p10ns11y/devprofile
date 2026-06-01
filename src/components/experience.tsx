"use client";

import { Calendar, Code, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, motionTransition } from "@/lib/motion";
import cvdata from "../data/cvdata.json";
import { AISmartHighlight } from "./ai-smart-highlight";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";
import { TimelineContent } from "./timeline";
import { Badge } from "./ui/badge";

const headingId = "experience-heading";

export function Experience() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionShell id="experience" headingId={headingId} background="elevated">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={motionTransition(!!shouldReduceMotion)}
      >
        <SectionHeading id={headingId} title="Professional Experience" />

        <TimelineContent />

        <ol role="list" className="space-y-10 mt-12">
          {cvdata.work_experience.map((experience) => (
            <li key={`${experience.company}-${experience.start_date}`}>
              <article className="bg-surface3/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/30 rad-shadow min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8 min-w-0">
                  <header className="lg:w-1/3 min-w-0 space-y-3">
                    <h3 className="text-xl font-bold text-text1">{experience.title}</h3>
                    <p className="text-sm text-text2">{experience.company}</p>
                    <dl className="flex flex-wrap gap-4 text-sm text-text2">
                      <div className="flex items-center gap-1">
                        <dt className="sr-only">Location</dt>
                        <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <dd>{experience.location}</dd>
                      </div>
                      <div className="flex items-center gap-1">
                        <dt className="sr-only">Dates</dt>
                        <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <dd>
                          {experience.start_date} – {experience.end_date}
                        </dd>
                      </div>
                      <div>
                        <dt className="sr-only">Duration</dt>
                        <dd className="bg-surface3 text-text1 px-2 py-1 rounded-md font-medium inline-block">
                          {experience.duration}
                        </dd>
                      </div>
                    </dl>
                  </header>

                  <div className="lg:w-2/3 min-w-0 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-text1 mb-4 flex items-center gap-2">
                        <Code className="w-4 h-4 text-brand" aria-hidden="true" />
                        Key achievements
                      </h4>
                      <ul role="list" className="space-y-3">
                        {experience.responsibilities.map((responsibility) => (
                          <li
                            key={responsibility.slice(0, 48)}
                            className="text-text1 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brand before:font-bold"
                          >
                            <AISmartHighlight>{responsibility}</AISmartHighlight>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-text1 mb-3">
                        Technologies &amp; tools
                      </h4>
                      <ul role="list" className="flex flex-wrap gap-2">
                        {experience.tools.map((tool) => (
                          <li key={tool}>
                            <Badge variant="outline">{tool}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </motion.div>
    </SectionShell>
  );
}
