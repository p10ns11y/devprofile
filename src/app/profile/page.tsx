import { Suspense } from "react";
import { Header } from "@/components/header";
import { ProfileDeck } from "@/components/profile-deck";
import { ProfileJourney } from "@/components/profile-journey";
import { PageShell } from "@/components/site/PageShell";
import { ProfileViewSwitch } from "./profile-view-switch";

export { generateMetadata } from "./social-metadata";

/**
 * THESIS: Curated GitHub journey as a type-first viewport deck — reading over decoration.
 * OWN-WORLD: brand surfaces + Instrument display; no slide photography; thin chapter rail + pager.
 * STORY: One beat per slide (no scroll); rail expands only the active chapter; archive as list beats.
 * FIRST VIEWPORT: Stacked tagline lines, thesis, craft beats — no name hero, no mid-deck CTAs; badges on Elsewhere.
 * SHARE: `?slide=<cue>` deep-links every beat (word cues, not internal ids); `?view=scroll` for full-page escape.
 * FORM: Experience · pathway C (no slide photography).
 */
export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-surface1 text-text2">
          Loading profile…
        </div>
      }
    >
      <ProfileViewSwitch
        deck={
          <div className="relative">
            <Header />
            <ProfileDeck />
          </div>
        }
        scroll={
          <PageShell>
            <ProfileJourney />
          </PageShell>
        }
      />
    </Suspense>
  );
}
