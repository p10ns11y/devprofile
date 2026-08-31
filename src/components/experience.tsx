import { landingInvite } from "@/data/landing-invite";
import { getWorkClaims } from "@/lib/homepage-from-cvdata";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";

const headingId = "work-heading";

export function Experience() {
  const { families, claims } = getWorkClaims();

  return (
    <SectionShell id="work" headingId={headingId} background="elevated">
      <SectionHeading
        id={headingId}
        title="Evidence"
        description={landingInvite.workLead}
        showUnderline
      />

      {families.map((family) => {
        const rows = claims.filter((claim) => claim.family === family.id);
        if (rows.length === 0) {
          return null;
        }
        return (
          <section key={family.id} className="claim-family" aria-labelledby={`${family.id}-heading`}>
            <h3 id={`${family.id}-heading`} className="subsection-title">
              {family.title}
            </h3>
            <ul className="claim-list">
              {rows.map((claim) => (
                <li key={claim.id} className="claim-item">
                  <h4 className="claim-item__title">{claim.label}</h4>
                  <ul className="claim-evidence">
                    {claim.evidence.map((item) => (
                      <li key={item.id} className="claim-evidence__row">
                        {item.figure ? (
                          <span className="claim-evidence__figure">{item.figure}</span>
                        ) : null}
                        <span className="claim-evidence__body">
                          <span className="claim-evidence__detail">{item.detail}</span>
                          <span className="claim-evidence__where">{item.where}</span>
                          {item.hrefs.length > 0 ? (
                            <span className="claim-evidence__links">
                              {item.hrefs.map((link) => (
                                <a key={link.url} href={link.url} className="claim-evidence__link">
                                  {link.label}
                                </a>
                              ))}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </SectionShell>
  );
}
