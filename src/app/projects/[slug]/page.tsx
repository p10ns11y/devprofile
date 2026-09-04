import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FocusRelated } from "@/components/focus/focus-related";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteButton } from "@/components/site/SiteButton";
import {
  getProjectWalkthrough,
  listProjectWalkthroughs,
  PROJECTS_INDEX_HREF,
  projectWalkthroughSlugs,
} from "@/data/project-walkthroughs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projectWalkthroughSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectWalkthrough(slug);
  if (!project) {
    return { title: "Project not found" };
  }

  const title = `${project.title} — project walkthrough`;
  const description = project.lede;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description,
      url: `/projects/${project.slug}`,
      siteName: "Peramanathan Sathyamoorthy",
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@peramanathan",
    },
  };
}

export default async function ProjectWalkthroughPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectWalkthrough(slug);
  if (!project) {
    notFound();
  }

  const siblings = listProjectWalkthroughs().filter((item) => item.slug !== project.slug);

  return (
    <div className="focus-page min-h-screen">
      <Header />

      <div className="focus-page__shell">
        <header className="focus-page__intro">
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
          <h1 className="focus-page__title">{project.title}</h1>
          <p className="focus-page__lede">{project.lede}</p>
          <ul className="projects-tech" aria-label="Stack">
            {project.tech.map((item) => (
              <li key={item} className="projects-tech__item">
                {item}
              </li>
            ))}
          </ul>
          <p className="projects-meta">
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              Source on GitHub
            </a>
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                Live
              </a>
            ) : null}
            {project.npmUrl ? (
              <a href={project.npmUrl} target="_blank" rel="noopener noreferrer">
                npm
              </a>
            ) : null}
          </p>
        </header>

        <article className="focus-page__article">
          {project.sections.map((section) => (
            <section key={section.id} aria-labelledby={`section-${section.id}`}>
              <h2 id={`section-${section.id}`}>{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.id}-${index}`}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div className="focus-page__close">
            <p>More walkthroughs in this set, or back to the landscape.</p>
            <div className="focus-page__close-actions">
              <SiteButton href={PROJECTS_INDEX_HREF} variant="primary" size="lg">
                All projects
              </SiteButton>
              <SiteButton href="/building" variant="outline" size="lg">
                Building landscape
              </SiteButton>
            </div>
          </div>

          {siblings.slice(0, 2).map((item) => (
            <FocusRelated
              key={item.slug}
              eyebrow="Also walk through"
              href={`/projects/${item.slug}`}
              title={item.title}
              detail={item.lede}
            />
          ))}
        </article>
      </div>

      <Footer />
    </div>
  );
}
