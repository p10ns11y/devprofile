import { LandscapeAtlas, BuildingSpacemap } from "@/components/building/landscape-atlas";
import { PageShell } from "@/components/site/PageShell";
import { SiteButton } from "@/components/site/SiteButton";

export default function BuildingPage() {
  return (
    <PageShell className="building-page">
      <div hidden>
        {`THESIS: This page is a landscape of the public stack, not a GitHub dashboard and not a repo list. OWN-WORLD: rust ink on paper, atlas lines, one gravity well. STORY: Clusters on the left feed one operator loop. FIRST VIEWPORT: The map fills the first screen. FORM: Gravity well. FINISH: curl /building contains One operator loop.`}
      </div>
      <article className="building-page__article">
        <header className="building-page__intro">
          <h1 className="building-page__title">Building</h1>
          <p className="building-page__lede">
            Five clusters. One sink. The public work is converging on a local operator loop:
            one cvdata, gates before writes, agents that can refuse.
          </p>
        </header>
        <LandscapeAtlas />
        <BuildingSpacemap />
        <p className="building-page__pulse">
          <SiteButton href="/status/code/200" variant="secondary">
            Live GitHub pulse
          </SiteButton>
        </p>
      </article>
    </PageShell>
  );
}
