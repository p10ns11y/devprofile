import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProjectWalkthroughCard } from "@/components/projects/project-walkthrough-card";
import { listProjectWalkthroughs } from "@/data/project-walkthroughs";

export default function ShippedIndexPage() {
  const walkthroughs = listProjectWalkthroughs();

  return (
    <div className="focus-page min-h-screen">
      <Header />

      <main className="focus-page__shell focus-page__shell--index">
        <header className="focus-page__intro">
          <h1 className="focus-page__title" data-lcv="must-show">
            Shipped
          </h1>
          <p className="focus-page__lede" data-lcv="must-show">
            Systems that shipped: who they serve, what they do, and how the architecture holds.
            Short walkthroughs, not a README dump.
          </p>
        </header>

        <section className="focus-index projects-gallery" aria-labelledby="shipped-gallery-heading">
          <h2 id="shipped-gallery-heading" className="focus-index__heading">
            Walkthrough gallery
          </h2>
          <ul role="list" className="focus-index__list projects-gallery__list">
            {walkthroughs.map((project) => (
              <li key={project.slug} className="focus-index__item">
                <ProjectWalkthroughCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
