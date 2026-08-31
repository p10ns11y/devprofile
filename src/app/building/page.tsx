import { BuildingSpacemap, LandscapeAtlas } from "@/components/building/landscape-atlas";
import { PageShell } from "@/components/site/PageShell";
import { SiteButton } from "@/components/site/SiteButton";

export default function BuildingPage() {
  return (
    <PageShell className="building-page">
      <div hidden>
        {`THESIS: This page is a landscape of the public stack, not a GitHub dashboard and not a repo list. OWN-WORLD: rust ink on paper, atlas lines, cluster bands and area docks, one gravity well. STORY: Clusters on the left feed four area docks into one operator loop. FIRST VIEWPORT: The map fills the first screen. FORM: Gravity well. FINISH: curl /building contains One operator loop.`}
      </div>
      <article className="building-page__article">
        <header className="building-page__intro">
          <div className="building-page__title-row">
            <h1 className="building-page__title">Building</h1>
            <SiteButton href="/building?building=view" variant="secondary">
              Live GitHub pulse
            </SiteButton>
          </div>
          <p className="building-page__lede">
            Five gravities. Four areas. One white hole. Clusters are the bands work sits in. Areas
            are the docks it falls through. Writing and metre share Creative; they are not the same
            craft.
          </p>
        </header>
        <LandscapeAtlas />
        <BuildingSpacemap />
      </article>
    </PageShell>
  );
}
