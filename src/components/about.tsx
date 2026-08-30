"use client";

import { motion, useReducedMotion } from "motion/react";
import { landingInvite } from "@/data/landing-invite";
import { fadeUp, motionTransition } from "@/lib/motion";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";

const headingId = "about-heading";

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
          <SectionHeading
            id={headingId}
            title="What you are hiring"
            description={landingInvite.summary}
            showUnderline
          />

          <ol className="hire-assets">
            {landingInvite.assets.map((asset) => (
              <li key={asset.title}>
                <article data-card="hire" className="hire-asset">
                  <h3 className="hire-asset__title">{asset.title}</h3>
                  <p className="hire-asset__line">{asset.line}</p>
                </article>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </SectionShell>
  );
}
