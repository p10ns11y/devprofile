"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import cvdata from "@/data/cvdata.json";
import { getLandingFeaturedCertificates } from "@/data/documents-data";
import { fadeUp, motionTransition } from "@/lib/motion";
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
        viewport={{ once: true }}
        transition={motionTransition(!!shouldReduceMotion)}
      >
        <SectionHeading
          id={headingId}
          title="Credentials"
          description="Proof of self-directed learning I've applied at work and in personal projects—and championed with teams when the fit is right."
          showUnderline
        />

        <ul role="list" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {certificates.map((cert) => {
            const displayName =
              courseMeta.get(cert.name) ?? cert.name.replace(/\.[^.]+$/, "").replace(/-/g, " ");
            return (
              <li key={cert.id} className="min-w-0">
                <article data-card="credential" className="credential-card">
                  <h3 className="font-semibold text-text1 leading-snug text-base">{displayName}</h3>
                  {cert.completionDate ? (
                    <p className="text-xs text-text2">{formatDate(cert.completionDate)}</p>
                  ) : null}
                  <Link href={`/certificates?id=${cert.id}`} className="credential-card__action">
                    View certificate
                    <ArrowRight className="inline-block size-3.5 ml-1 -mt-0.5" aria-hidden="true" />
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>

        {externalCourses.length > 0 ? (
          <div className="mt-10 pt-8 border-t border-border/40">
            <h3 className="text-lg font-semibold text-text1 mb-4">Additional learning</h3>
            <ul role="list" className="grid sm:grid-cols-2 gap-4 md:gap-5">
              {externalCourses.map((course) => (
                <li key={course.name} className="min-w-0">
                  <article data-card="credential" className="credential-card">
                    <h4 className="font-semibold text-text1 leading-snug">{course.name}</h4>
                    {course.completionDate ? (
                      <p className="text-xs text-text2">{formatDate(course.completionDate)}</p>
                    ) : null}
                    <span className="credential-card__tag">{course.domain}</span>
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="credential-card__action inline-flex items-center"
                    >
                      <ExternalLink className="size-3.5 mr-1.5 shrink-0" aria-hidden="true" />
                      {course.proof_of_accomplishment === "github_code_repo"
                        ? "View repository"
                        : "View proof"}
                    </a>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="text-center mt-10">
          <SiteButton variant="outline" href="/certificates">
            Browse all certificates
          </SiteButton>
        </div>
      </motion.div>
    </SectionShell>
  );
}
