"use client";

import { Calendar, Code, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { landingInvite } from "@/data/landing-invite";
import { roleAnchorId } from "@/lib/experience-anchors";
import {
  defaultViewport,
  fadeUp,
  itemTransition,
  motionTransition,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";
import cvdata from "../data/cvdata.json";
import { AISmartHighlight } from "./ai-smart-highlight";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";
import { TimelineContent } from "./timeline";

const headingId = "experience-heading";

export function Experience() {
  const shouldReduceMotion = useReducedMotion();
  const reduced = !!shouldReduceMotion;

  return (
    <SectionShell id="experience" headingId={headingId} background="elevated">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        transition={motionTransition(reduced)}
      >
        <SectionHeading
          id={headingId}
          title="Professional Experience"
          description={landingInvite.experienceLead}
          showUnderline
        />

        <div className="section-body">
          <TimelineContent />

          <motion.ol
            role="list"
            className="experience-roles"
            variants={reduced ? undefined : staggerContainer}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={defaultViewport}
          >
            {cvdata.work_experience.map((experience) => (
              <motion.li
                key={`${experience.company}-${experience.start_date}`}
                variants={reduced ? undefined : staggerItem}
                transition={itemTransition(reduced)}
              >
                <article
                  id={roleAnchorId(experience)}
                  data-card="experience-role"
                  className="experience-role-card"
                >
                  <div className="experience-role-card__layout">
                    <header className="experience-role-card__aside min-w-0">
                      <h3 className="experience-role-card__title">{experience.title}</h3>
                      <p className="experience-role-card__company">{experience.company}</p>
                      <dl className="experience-role-card__meta">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <dt className="sr-only">Location</dt>
                          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <dd>{experience.location}</dd>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <dt className="sr-only">Dates</dt>
                          <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <dd>
                            {experience.start_date} – {experience.end_date}
                          </dd>
                        </div>
                        {experience.duration ? (
                          <div>
                            <dt className="sr-only">Duration</dt>
                            <dd>
                              <span className="surface-pill">{experience.duration}</span>
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </header>

                    <div className="experience-role-card__body min-w-0">
                      {"kind" in experience && experience.kind === "independent_work" ? (
                        <p className="experience-role-card__slice">
                          {landingInvite.independentSlice}
                        </p>
                      ) : null}
                      <div>
                        <h4 className="experience-detail-label">
                          <Code
                            className="w-4 h-4 text-(--color-brand-emphasis)"
                            aria-hidden="true"
                          />
                          Key achievements
                        </h4>
                        <ul role="list" className="experience-detail-list">
                          {experience.responsibilities.map((responsibility) => (
                            <li key={responsibility.slice(0, 48)}>
                              <AISmartHighlight>{responsibility}</AISmartHighlight>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="experience-detail-label">Technologies &amp; tools</h4>
                        <ul role="list" className="experience-tools">
                          {experience.tools.map((tool) => (
                            <li key={tool}>
                              <span className="surface-pill">{tool}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </article>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </motion.div>
    </SectionShell>
  );
}
