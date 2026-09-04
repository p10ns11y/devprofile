import Link from "next/link";
import type { ProjectWalkthrough } from "@/data/project-walkthroughs";

export function ProjectWalkthroughCard({ project }: { project: ProjectWalkthrough }) {
  return (
    <article data-card="project">
      <Link href={`/projects/${project.slug}`} className="projects-index-card__link">
        <p className="projects-index-card__eyebrow">{project.eyebrow}</p>
        <h3 className="projects-index-card__title">{project.title}</h3>
        <p className="projects-index-card__lede">{project.lede}</p>
        <ul className="projects-index-card__tech" aria-label="Technologies">
          {project.tech.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="projects-index-card__cta">
          Read walkthrough <span aria-hidden="true">→</span>
        </p>
      </Link>
    </article>
  );
}
