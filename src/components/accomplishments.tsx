"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import cvdata from "@/data/cvdata.json";
import { getLandingFeaturedCertificates } from "@/data/documents-data";
import { landingInvite } from "@/data/landing-invite";
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
              <blockquote>
                <p>{landingInvite.credentialsQuote}</p>
              </blockquote>
              <figcaption>{cvdata.name}</figcaption>
            </figure>
            <p className="section-lead credentials-intro">{landingInvite.credentialsIntro}</p>
          </div>

          {externalCourses.length > 0 ? (
            <div className="credentials-block">
              <h3 className="subsection-title subsection-heading" data-align="center">
                Recent courses
              </h3>
              <ul
                role="list"
                className="credentials-grid !flex flex-wrap justify-center [&>li]:basis-full sm:[&>li]:max-w-[calc((100%-var(--marketing-space-grid))/2)] sm:[&>li]:basis-[calc((100%-var(--marketing-space-grid))/2)] lg:[&>li]:max-w-[calc((100%-3*var(--marketing-space-grid))/4)] lg:[&>li]:basis-[calc((100%-3*var(--marketing-space-grid))/4)]"
                data-grid="courses"
              >
                {externalCourses.map((course) => (
                  <li key={course.name} className="min-w-0 grow-0">
                    <article data-card="credential" className="credential-card">
                      <h4 className="credential-card__title">{course.name}</h4>
                      <span className="credential-card__tag">{course.domain}</span>
                      <div className="credential-card__foot">
                        {course.completionDate ? (
                          <p className="credential-card__date">
                            {formatDate(course.completionDate)}
                          </p>
                        ) : (
                          <span className="credential-card__date" data-empty aria-hidden="true" />
                        )}
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="credential-card__cta"
                          data-cta="icon"
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
