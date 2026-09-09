import type { HireContent } from "@/lib/hire-content";
import type { HireLayoutHooks } from "@/lib/hire-layout-derived";
import { lcvPreview } from "@/lib/hire-lcv";

type HireEvidenceSectionProps = {
  content: Pick<HireContent, "families" | "claims" | "workLead">;
  layout: HireLayoutHooks;
};

export function HireEvidenceSection({ content, layout }: HireEvidenceSectionProps) {
  const cards = content.families.flatMap((family) => {
    const rows = content.claims.filter((claim) => claim.family === family.id);
    return rows.map((claim) => ({ family, claim }));
  });

  if (cards.length === 0) return null;

  return (
    <section
      id="work"
      className="hire-phi__section hire-phi__section--muted"
      aria-labelledby="hire-work-heading"
      {...lcvPreview}
    >
      <div className="phi-route-band hire-phi__cluster">
        <header className="hire-phi__section-header">
          <h2 id="hire-work-heading" className="hire-phi__section-title">
            Evidence
          </h2>
          {content.workLead ? <p className="hire-phi__section-lead">{content.workLead}</p> : null}
        </header>

        <div className={layout.evidence} data-evidence-cols={layout.evidenceCols}>
          {cards.map(({ family, claim }) => (
            <article key={claim.id} className="hire-phi__evidence-card">
              <p className="hire-phi__family-eyebrow">{family.title}</p>
              <h3 className="hire-phi__claim-label">{claim.label}</h3>
              <ul className="hire-phi__evidence-list">
                {claim.evidence.map((item) => (
                  <li key={item.id} className="hire-phi__evidence-item" {...lcvPreview}>
                    {item.figure ? <span className="hire-phi__figure">{item.figure}</span> : null}
                    <span className="hire-phi__evidence-detail">{item.detail}</span>
                    <span className="hire-phi__evidence-where">{item.where}</span>
                    {item.hrefs.length > 0 ? (
                      <span className={layout.evidenceLinks}>
                        {item.hrefs.map((link) => (
                          <a key={link.url} href={link.url}>
                            {link.label}
                          </a>
                        ))}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
