import { redirect } from "next/navigation";
import { FocusEssayCard } from "@/components/focus/focus-essay-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { listFocusIndexEssays } from "@/data/focus-essays";

export default async function FocusIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ paper?: string }>;
}) {
  const { paper } = await searchParams;
  if (paper === "view") {
    redirect("/focus/eeaas-to-agents?paper=view");
  }

  const { featured, rest } = listFocusIndexEssays();

  return (
    <div className="focus-page min-h-screen">
      {/*
        THESIS: Focus is an essay index; each card is a nested argument.
        OWN-WORLD: Same Focus tokens; cards reuse diagram frames.
        STORY: Visitor picks EEaaS→agents or pulse-memory without leaving the series.
        FIRST VIEWPORT: Title + lede + featured thesis card.
        FORM: Semantic list of articles; whole-card links.
        FINISH: type-check/lint; old ?paper=view still reaches the white paper.
      */}
      <Header />

      <div className="focus-page__shell focus-page__shell--index">
        <header className="focus-page__intro">
          <h1 className="focus-page__title">Focus</h1>
          <p className="focus-page__lede">
            Essays on the layers you can actually change: the harness, memory, and the cost of the
            next useful observation. Learning should get cheaper while decisions get better.
          </p>
        </header>

        <section className="focus-index" aria-labelledby="focus-essays-heading">
          <h2 id="focus-essays-heading" className="focus-index__heading">
            Essays
          </h2>
          <ul role="list" className="focus-index__list">
            <li key={featured.slug} className="focus-index__item focus-index__item--featured">
              <FocusEssayCard essay={featured} featured />
            </li>
            {rest.map((essay) => (
              <li key={essay.slug} className="focus-index__item">
                <FocusEssayCard essay={essay} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}
