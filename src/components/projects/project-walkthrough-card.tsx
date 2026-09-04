import Link from "next/link";
import type { ProjectWalkthrough } from "@/data/project-walkthroughs";
import { lcvInteract } from "@/lib/lcv-interact";

export function ProjectWalkthroughCard({ project }: { project: ProjectWalkthrough }) {
  const href = `/shipped/${project.slug}`;

  return (
    <article data-card="project">
      <Link
        href={href}
        className="projects-index-card__link"
        {...lcvInteract({
          event: "navigate",
          from: "/shipped",
          success: href,
        })}
      >
        <p className="projects-index-card__eyebrow">{project.eyebrow}</p>
        <h3 className="projects-index-card__title">{project.title}</h3>
        <p className="projects-index-card__lede" data-lcv="preview">
          {project.lede}
        </p>
        <ul className="projects-index-card__outcomes" aria-label="Outcomes" data-lcv="preview">
          {project.outcomes.slice(0, 3).map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
        <ul className="projects-index-card__tech" aria-label="Technologies">
          {project.tech.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="projects-index-card__cta">
          Open product walkthrough <span aria-hidden="true">→</span>
        </p>
      </Link>
    </article>
  );
}
