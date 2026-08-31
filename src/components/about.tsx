import { landingInvite } from "@/data/landing-invite";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";

const headingId = "about-heading";

export function About() {
  return (
    <SectionShell id="about" headingId={headingId} background="elevated">
      <SectionHeading
        id={headingId}
        title="What you are hiring"
        description={landingInvite.summary}
        showUnderline
      />

      <ol className="hire-proofs">
        {landingInvite.proofs.map((proof) => (
          <li key={proof.n} className="hire-proof" value={proof.n}>
            <h3 className="hire-proof__title">{proof.title}</h3>
            <p className="hire-proof__line">{proof.line}</p>
            {"href" in proof && proof.href ? (
              <p className="hire-proof__link">
                <a href={proof.href.url}>{proof.href.label}</a>
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      <p className="hire-arc">
        The long arc from 2015 orchestration to 2026 local agent work lives in{" "}
        <a href={landingInvite.arcHref.url}>{landingInvite.arcHref.label}</a>.
      </p>
    </SectionShell>
  );
}
