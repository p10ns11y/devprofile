"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { AISmartHighlight } from "@/components/ai-smart-highlight";
import cvData from "@/data/cvdata.json";
import { getCvFeaturedProjects } from "@/lib/cv-featured-projects";

const CvMasonryLayout = dynamic(() => import("@/app/cv/content-layout"), { ssr: false });

export function CvWebContent() {
  return (
    <Suspense fallback={<p className="cv-loading">Loading CV…</p>}>
      <CvMasonryLayout ratios={[34, 21]} gap={1}>
        <div id="mainContent" className="cv-panel">
          <h3 className="cv-section-title">Professional Profile</h3>
          <div className="cv-prose">
            <AISmartHighlight>{cvData.profile}</AISmartHighlight>
          </div>

          <h3 className="cv-section-title">Work Experience</h3>
          <div className="cv-stack">
            {cvData.work_experience.map((job) => {
              const companyUrl =
                "company_url" in job && typeof (job as { company_url?: string }).company_url === "string"
                  ? (job as { company_url: string }).company_url
                  : undefined;
              return (
              <article key={`${job.company}-${job.title}-${job.start_date}`} className="cv-role">
                <h4 className="cv-role__title">
                  {job.title} ·{" "}
                  {companyUrl ? (
                    <a href={companyUrl} target="_blank" rel="nofollow noreferrer noopener">
                      {job.company}
                    </a>
                  ) : (
                    job.company
                  )}
                </h4>
                <p className="cv-role__meta">
                  {job.location} · {job.start_date} – {job.end_date}
                </p>
                <ul className="cv-role__list" role="list">
                  {job.responsibilities.map((resp) => (
                    <li key={resp.slice(0, 48)}>
                      <AISmartHighlight>{resp}</AISmartHighlight>
                    </li>
                  ))}
                </ul>
                <p className="cv-role__tools">
                  <span className="cv-role__tools-label">Tools & technologies</span>
                  {job.tools.join(", ")}
                </p>
              </article>
              );
            })}
          </div>
        </div>

        <div className="cv-panel">
          <h3 className="cv-section-title">Skills</h3>
          <div className="cv-skill-group">
            <h4 className="cv-skill-group__label">Product</h4>
            <ul className="cv-pills" role="list">
              {cvData.skills.product.map((skill) => (
                <li key={skill}>
                  <span className="surface-pill">{skill}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cv-skill-group">
            <h4 className="cv-skill-group__label">Development</h4>
            <ul className="cv-pills" role="list">
              {cvData.skills.practices.map((skill) => (
                <li key={skill}>
                  <span className="surface-pill">{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="cv-panel">
          <h3 className="cv-section-title">Projects</h3>
          <ul className="cv-links" role="list">
            {getCvFeaturedProjects(cvData.projects).map((project) => (
              <li key={project.key ?? project.name}>
                <a
                  href={project.url}
                  className="cv-links__title"
                  target="_blank"
                  rel="nofollow noreferrer noopener"
                >
                  {project.name}
                </a>
                <p className="cv-links__desc">{project.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="cv-panel">
          <h3 className="cv-section-title">Accomplishments</h3>
          <ul className="cv-links" role="list">
            {cvData.courses.map((course) => (
              <li key={course.name}>
                <a
                  href={course.url}
                  className="cv-links__title"
                  target="_blank"
                  rel="nofollow noreferrer noopener"
                >
                  {course.name}
                </a>
                <p className="cv-links__desc">{course.domain}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="cv-panel">
          <h3 className="cv-section-title">Technologies</h3>
          <dl className="cv-tech">
            {Object.entries(cvData.technologies).map(([category, items]) => (
              <div key={category} className="cv-tech__row">
                <dt className="cv-tech__term">{category}</dt>
                <dd className="cv-tech__detail">{items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="cv-panel">
          <h3 className="cv-section-title">Education</h3>
          <ul className="cv-stack" role="list">
            {cvData.education.map((edu) => (
              <li key={edu.degree}>
                <h4 className="cv-edu__degree">{edu.degree}</h4>
                <p className="cv-edu__school">{edu.institution}</p>
                <p className="cv-edu__years">{edu.years}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="cv-panel">
          <h3 className="cv-section-title">Publications</h3>
          <ul className="cv-links" role="list">
            {cvData.publications.map((pub) => (
              <li key={pub.title}>
                <a
                  href={pub.doi_url || pub.url}
                  className="cv-links__title"
                  target="_blank"
                  rel="nofollow noreferrer noopener"
                >
                  {pub.title}
                </a>
                <p className="cv-links__desc">
                  {pub.journal ? pub.journal.name : pub.conference},{" "}
                  {pub.first_published || pub.date}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="cv-panel">
          <h3 className="cv-section-title">Languages</h3>
          <dl className="cv-lang">
            {Object.entries(cvData.languages).map(([language, level]) => (
              <div key={language} className="cv-lang__row">
                <dt>{language}</dt>
                <dd>{level}</dd>
              </div>
            ))}
          </dl>
        </div>
      </CvMasonryLayout>
    </Suspense>
  );
}
