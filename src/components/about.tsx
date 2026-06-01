"use client";

import { Code2, Lightbulb, Users, Zap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, motionTransition } from "@/lib/motion";
import cvdata from "../data/cvdata.json";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { AISmartHighlight } from "./ai-smart-highlight";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";
import { Card, CardContent } from "./ui/card";

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

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start min-w-0">
            <div className="space-y-5 min-w-0">
              <p className="text-lg text-text1 leading-relaxed">
                <AISmartHighlight>{cvdata.profile}</AISmartHighlight>
              </p>

              <ul role="list" className="flex flex-wrap gap-2">
                {skillPills.map((skill) => (
                  <li
                    key={skill}
                    className="px-3 py-1.5 bg-surface3 text-text1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <ul role="list" className="grid grid-cols-2 gap-3 min-w-0">
              {features.map((feature) => (
                <li key={feature.title}>
                  <Card className="h-full border border-border/30 bg-surface1 shadow-sm">
                    <CardContent className="p-4 text-center space-y-3">
                      <div
                        className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center mx-auto"
                        aria-hidden="true"
                      >
                        <feature.icon className="w-5 h-5 text-brand" />
                      </div>
                      <h3 className="font-semibold text-sm text-text1">{feature.title}</h3>
                      <p className="text-xs text-text2 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}
