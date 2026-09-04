import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FocusRelated } from "@/components/focus/focus-related";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProjectWalkthroughBlocks } from "@/components/projects/project-walkthrough-blocks";
import { ProjectWalkthroughHero } from "@/components/projects/project-walkthrough-hero";
import { ProjectWalkthroughMermaid } from "@/components/projects/project-walkthrough-mermaid";
import { SiteButton } from "@/components/site/SiteButton";
import {
  getArchitectureDiagram,
  getProjectWalkthrough,
  listProjectWalkthroughs,
  projectWalkthroughSlugs,
  SHIPPED_INDEX_HREF,
  sectionBlocksWithoutLeadingDiagram,
  walkthroughSectionsByBand,
} from "@/data/project-walkthroughs";
import { lcvInteract } from "@/lib/lcv-interact";

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
    return { title: "Walkthrough not found" };
  }

  const title = `${project.title} — shipped walkthrough`;
  const description = project.lede;

  return {
    title,
    description,
    alternates: { canonical: `/shipped/${project.slug}` },
    openGraph: {
      title,
      description,
      url: `/shipped/${project.slug}`,
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

export default async function ShippedWalkthroughPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectWalkthrough(slug);
  if (!project) {
    notFound();
  }

  const siblings = listProjectWalkthroughs().filter((item) => item.slug !== project.slug);
  const productSections = walkthroughSectionsByBand(project, "product");
  const techSections = walkthroughSectionsByBand(project, "tech");
  const architectureDiagram = getArchitectureDiagram(project);
  const from = `/shipped/${project.slug}`;

  return (
    <div className="focus-page min-h-screen">
      <Header />

      <main className="focus-page__shell">
        <ProjectWalkthroughHero project={project} />

        <article className="focus-page__article projects-article">
          {productSections.map((section) => (
            <section
              key={section.id}
              className="projects-section projects-section--product"
              aria-labelledby={`section-${section.id}`}
            >
              <h2 id={`section-${section.id}`}>{section.title}</h2>
              <ProjectWalkthroughBlocks blocks={section.blocks} />
            </section>
          ))}

          <div className="projects-tech-band">
            <header className="projects-tech-band__intro">
              <h2 className="projects-tech-band__title">Tech and architecture</h2>
            </header>

            {architectureDiagram ? (
              <ProjectWalkthroughMermaid code={architectureDiagram.code} />
            ) : null}

            <ul className="projects-tech" aria-label="Stack">
              {project.tech.map((item) => (
                <li key={item} className="projects-tech__item">
                  {item}
                </li>
              ))}
            </ul>

            {techSections.map((section) => (
              <section
                key={section.id}
                className="projects-section projects-section--tech"
                aria-labelledby={`section-${section.id}`}
              >
                <h3 id={`section-${section.id}`} className="projects-section__title">
                  {section.title}
                </h3>
                <ProjectWalkthroughBlocks blocks={sectionBlocksWithoutLeadingDiagram(section)} />
              </section>
            ))}
          </div>

          <div className="focus-page__close">
            <p>More shipped walkthroughs in this set, or back to the landscape.</p>
            <div className="focus-page__close-actions">
              <SiteButton
                href={SHIPPED_INDEX_HREF}
                variant="primary"
                size="lg"
                {...lcvInteract({
                  event: "navigate",
                  from,
                  success: SHIPPED_INDEX_HREF,
                })}
              >
                All shipped
              </SiteButton>
              <SiteButton
                href="/building"
                variant="outline"
                size="lg"
                {...lcvInteract({
                  event: "navigate",
                  from,
                  success: "/building",
                })}
              >
                Building landscape
              </SiteButton>
            </div>
          </div>

          {siblings.slice(0, 2).map((item) => (
            <FocusRelated
              key={item.slug}
              eyebrow="Also walk through"
              href={`/shipped/${item.slug}`}
              title={item.title}
              detail={item.lede}
            />
          ))}
        </article>
      </main>

      <Footer />
    </div>
  );
}
