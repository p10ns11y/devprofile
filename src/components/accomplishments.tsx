"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import cvdata from "@/data/cvdata.json";
import { getLandingFeaturedCertificates } from "@/data/documents-data";
import { defaultViewport, fadeUp, motionTransition } from "@/lib/motion";
import { CredentialsPullquote } from "./credentials-pullquote";
import { EarnedCourseCards } from "./earned-course-cards";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";
import { SiteButton } from "./site/SiteButton";

const headingId = "accomplishments-heading";

const certificates = getLandingFeaturedCertificates(4);

const courseMeta = new Map(cvdata.certificates.map((cert) => [cert.filename, cert.course]));

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function Accomplishments() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionShell id="accomplishments" headingId={headingId} background="elevated">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        transition={motionTransition(!!shouldReduceMotion)}
      >
        <SectionHeading id={headingId} title="Credentials" showUnderline />

        <div className="section-body">
          <div className="credentials-prose">
            <CredentialsPullquote />
          </div>

          <EarnedCourseCards
            headingId="recent-courses-heading"
            heading="Recent courses"
            headingLevel="h3"
          />

          <div className="credentials-block">
            <h3 className="subsection-title subsection-heading" data-align="center">
              Featured certificates
            </h3>
            <ul role="list" className="credentials-grid" data-grid="featured">
              {certificates.map((cert) => {
                const displayName =
                  courseMeta.get(cert.name) ?? cert.name.replace(/\.[^.]+$/, "").replace(/-/g, " ");
                return (
                  <li key={cert.id} className="min-w-0">
                    <article data-card="credential" className="credential-card">
                      <h4 className="credential-card__title">{displayName}</h4>
                      <div className="credential-card__foot">
                        {cert.completionDate ? (
                          <p className="credential-card__date">{formatDate(cert.completionDate)}</p>
                        ) : (
                          <span className="credential-card__date" data-empty aria-hidden="true" />
                        )}
                        <Link href={`/certificates?id=${cert.id}`} className="credential-card__cta">
                          View
                          <ArrowRight className="credential-card__cta-icon" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>

          <footer className="credentials-footer">
            <SiteButton variant="outline" href="/certificates">
              Browse all certificates
            </SiteButton>
          </footer>
        </div>
      </motion.div>
    </SectionShell>
  );
}
