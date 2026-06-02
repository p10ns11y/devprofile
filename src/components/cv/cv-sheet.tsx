"use client";

import { SocialLinks } from "@/components/social-links";
import cvData from "@/data/cvdata.json";
import { CvWebContent } from "./cv-web-content";

export function CvSheet() {
  return (
    <article className="cv-sheet" data-card="cv">
      <header className="cv-sheet__header">
        <h2 className="cv-sheet__name">{cvData.name}</h2>
        <p className="cv-sheet__role">{cvData.latest_proffessional_role}</p>
        <p className="cv-sheet__contact">
          <a href={`mailto:${cvData.contact.email}`}>{cvData.contact.email}</a>
          <span aria-hidden="true"> · </span>
          <a href={`tel:${cvData.contact.phone}`}>{cvData.contact.phone}</a>
          <span aria-hidden="true"> · </span>
          <span>{cvData.contact.citizenship}</span>
        </p>
        <SocialLinks className="cv-sheet__social" size="compact" />
      </header>
      <CvWebContent />
    </article>
  );
}
