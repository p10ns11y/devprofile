import Link from "next/link";
import { SiteButton } from "@/components/site/SiteButton";
import type { ProjectWalkthrough } from "@/data/project-walkthroughs";
import { PROJECTS_INDEX_HREF } from "@/data/project-walkthroughs";
import { lcvInteract } from "@/lib/lcv-interact";

export function ProjectWalkthroughHero({ project }: { project: ProjectWalkthrough }) {
  const from = `/projects/${project.slug}`;

  return (
    <header className="focus-page__intro projects-hero">
      <nav className="focus-series" aria-label="Projects">
        <ol>
          <li>
            <Link href={PROJECTS_INDEX_HREF}>Projects</Link>
          </li>
          <li>
            <span aria-current="page">{project.cvdataKey}</span>
          </li>
        </ol>
      </nav>

      <p className="projects-index-card__eyebrow">{project.eyebrow}</p>
      <h1 className="focus-page__title" data-lcv="must-show">
        {project.title}
      </h1>
      <p className="focus-page__lede" data-lcv="must-show">
        {project.lede}
      </p>

      <p className="projects-audience">
        <span className="projects-audience__label">For</span> {project.audience}
      </p>

      <ul className="projects-outcomes" aria-label="Outcomes" data-lcv="must-show">
        {project.outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>

      <div className="projects-surfaces">
        <h2 className="projects-surfaces__heading">Surfaces</h2>
        <ul className="projects-surfaces__list">
          {project.surfaces.map((surface) => (
            <li key={surface}>{surface}</li>
          ))}
        </ul>
      </div>

      <div className="projects-hero__ctas" data-lcv="must-show">
        <SiteButton
          href={project.repoUrl}
          variant="primary"
          size="lg"
          {...lcvInteract({
            event: "navigate",
            from,
            success: project.repoUrl,
          })}
        >
          Source on GitHub
        </SiteButton>
        {project.liveUrl ? (
          <SiteButton
            href={project.liveUrl}
            variant="outline"
            size="lg"
            {...lcvInteract({
              event: "navigate",
              from,
              success: project.liveUrl,
            })}
          >
            Open live
          </SiteButton>
        ) : null}
        {project.npmUrl ? (
          <SiteButton
            href={project.npmUrl}
            variant="outline"
            size="lg"
            {...lcvInteract({
              event: "navigate",
              from,
              success: project.npmUrl,
            })}
          >
            npm package
          </SiteButton>
        ) : null}
      </div>
    </header>
  );
}
