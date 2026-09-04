import { ProjectWalkthroughCard } from "@/components/projects/project-walkthrough-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { listProjectWalkthroughs } from "@/data/project-walkthroughs";

export default function ProjectsIndexPage() {
  const projects = listProjectWalkthroughs();

  return (
    <div className="focus-page min-h-screen">
      {/*
        THESIS: Projects is an index of real architecture walkthroughs, not a repo dump.
        OWN-WORLD: Same Focus editorial tokens; cards without diagram frames.
        STORY: Visitor picks a shipped system and reads problem → ops.
        FIRST VIEWPORT: Title + lede + walkthrough cards.
        FORM: Semantic list of articles; whole-card links.
        FINISH: type-check/lint; /projects and /projects/[slug] resolve.
      */}
      <Header />

      <div className="focus-page__shell focus-page__shell--index">
        <header className="focus-page__intro">
          <h1 className="focus-page__title">Projects</h1>
          <p className="focus-page__lede">
            Technical and architectural walkthroughs for systems that shipped: local operator
            loops, cultural-computational metre, adaptable validation, and privacy-first agent
            tooling. Not a gallery of READMEs.
          </p>
        </header>

        <section className="focus-index" aria-labelledby="projects-walkthroughs-heading">
          <h2 id="projects-walkthroughs-heading" className="focus-index__heading">
            Walkthroughs
          </h2>
          <ul role="list" className="focus-index__list">
            {projects.map((project) => (
              <li key={project.slug} className="focus-index__item">
                <ProjectWalkthroughCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}
