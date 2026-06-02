"use client";

import { Code2, Lightbulb, Users, Zap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, motionTransition } from "@/lib/motion";
import cvdata from "../data/cvdata.json";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { AISmartHighlight } from "./ai-smart-highlight";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";

const headingId = "about-heading";

const skillPills = [
  "Engineering Leadership",
  "TypeScript Integration",
  "Team Mentoring",
  "API Architecture",
];

const features = [
  {
    icon: Code2,
    title: "Clean Code",
    description: "Writing maintainable, scalable code that stands the test of time.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Always exploring new technologies and creative solutions.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Working effectively with teams to deliver exceptional results.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Building fast, optimized applications for the best user experience.",
  },
] as const;

export function About() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionShell id="about" headingId={headingId} background="elevated">
      <div ref={ref}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isIntersecting ? "visible" : "hidden"}
          transition={motionTransition(!!shouldReduceMotion)}
        >
          <SectionHeading id={headingId} title="About Me" showUnderline />

          <div className="about-layout">
            <article className="min-w-0" aria-labelledby={`${headingId}-profile`}>
              <h3 id={`${headingId}-profile`} className="sr-only">
                Professional summary
              </h3>
              <p className="about-profile">
                <AISmartHighlight>{cvdata.profile}</AISmartHighlight>
              </p>

              <p className="eyebrow about-focus-label">Focus areas</p>
              <ul role="list" className="about-skills">
                {skillPills.map((skill) => (
                  <li key={skill}>
                    <span className="about-skill-pill">{skill}</span>
                  </li>
                ))}
              </ul>
            </article>

            <div className="min-w-0">
              <h3 className="subsection-title subsection-heading" data-align="center">
                How I work
              </h3>
              <ul role="list" className="about-values">
                {features.map((feature) => (
                  <li key={feature.title}>
                    <article data-card="about-value" className="about-value-card">
                      <div className="about-value-card__icon" aria-hidden="true">
                        <feature.icon className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <h4 className="about-value-card__title">{feature.title}</h4>
                      <p className="about-value-card__desc">{feature.description}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}
