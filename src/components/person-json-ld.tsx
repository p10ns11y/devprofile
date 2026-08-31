import cvdata from "@/data/cvdata.json";
import { landingInvite } from "@/data/landing-invite";
import { getMetadataBase } from "@/lib/site-url";

export function PersonJsonLd() {
  const origin = getMetadataBase().origin;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: cvdata.name,
    jobTitle: landingInvite.role,
    email: cvdata.contact.email,
    url: origin,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Stockholm",
      addressCountry: "SE",
    },
    sameAs: [cvdata.cv_social_links.github, cvdata.cv_social_links.x],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify of a local object
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
