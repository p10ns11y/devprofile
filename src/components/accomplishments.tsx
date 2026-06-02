"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import cvdata from "@/data/cvdata.json";
import { getLandingFeaturedCertificates } from "@/data/documents-data";
import { defaultViewport, fadeUp, motionTransition } from "@/lib/motion";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";
import { SiteButton } from "./site/SiteButton";

const headingId = "accomplishments-heading";

const certificates = getLandingFeaturedCertificates(4);

const courseMeta = new Map(cvdata.certificates.map((cert) => [cert.filename, cert.course]));

const externalCourses = cvdata.courses
  .filter(
    (course) =>
      course.proof_of_accomplishment !== "accomplishment_url" ||
      !course.url.includes("/certificates/")
  )
  .sort((a, b) => {
    const dateA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
    const dateB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
    return dateB - dateA;
  });

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
            <figure className="credentials-pullquote">
              <blockquote cite={`#${headingId}`}>
                <p>
                  Grok and coding agents are becoming mostly sufficient even for advanced work.
                  Well-crafted courses — built with deliberate team effort and AI assistance — still
                  offer powerful leverage. They compress extensive research, impose useful
                  structure, and surface new ways of thinking, saving the learner significant time
                  and friction. What ultimately matters most is the learner’s own curiosity and
                  interest. The highest-value courses deliver outcomes that are highly applicable,
                  pragmatic, and relevant to the current state of the art — creating positive impact
                  for both the individual and society while remaining cost-effective.
                </p>
              </blockquote>
              <figcaption>— {cvdata.name}</figcaption>
            </figure>

            <p className="section-lead credentials-intro">
              Proof of self-directed learning I&apos;ve applied at work and in personal projects—and
              championed with teams when the fit is right.
            </p>
          </div>

          {externalCourses.length > 0 ? (
            <div className="credentials-block">
              <h3 className="subsection-title subsection-heading subsection-heading--center">
                Recent courses
              </h3>
              <ul role="list" className="credentials-grid credentials-grid--featured">
                {externalCourses.map((course) => (
                  <li key={course.name} className="min-w-0">
                    <article data-card="credential" className="credential-card">
                      <h4 className="credential-card__title">{course.name}</h4>
                      <span className="credential-card__tag">{course.domain}</span>
                      <div className="credential-card__foot">
                        {course.completionDate ? (
                          <p className="credential-card__date">
                            {formatDate(course.completionDate)}
                          </p>
                        ) : (
                          <span
                            className="credential-card__date credential-card__date--empty"
                            aria-hidden="true"
                          />
                        )}
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="credential-card__cta credential-card__cta--icon"
                          aria-label={
                            course.proof_of_accomplishment === "github_code_repo"
                              ? `View repository for ${course.name} (opens in new tab)`
                              : `View proof for ${course.name} (opens in new tab)`
                          }
                        >
                          <ExternalLink className="credential-card__cta-icon" aria-hidden="true" />
                        </a>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="credentials-block">
            <h3 className="subsection-title subsection-heading subsection-heading--center">
              Featured certificates
            </h3>
            <ul role="list" className="credentials-grid credentials-grid--featured">
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
                          <span
                            className="credential-card__date credential-card__date--empty"
                            aria-hidden="true"
                          />
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
