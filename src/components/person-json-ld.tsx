import { PRODUCTION_SITE_ORIGIN } from "@/lib/site-url";

const HEADLINE = "Senior Product and Systems Engineer · AI/SI agentic workflows";

export function PersonJsonLd() {
  const origin = PRODUCTION_SITE_ORIGIN;
  const personId = `${origin}/#person`;
  const pageId = `${origin}/#profile`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": pageId,
        url: `${origin}/`,
        name: `Peramanathan Sathyamoorthy: ${HEADLINE}`,
        dateModified: "2026-11-25",
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: "Peramanathan Sathyamoorthy",
        givenName: "Peramanathan",
        familyName: "Sathyamoorthy",
        jobTitle: HEADLINE,
        url: `${origin}/`,
        email: "mailto:sathyam.peram@gmail.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Stockholm",
          addressCountry: "SE",
        },
        alumniOf: [
          {
            "@type": "CollegeOrUniversity",
            name: "Uppsala University",
            url: "https://www.uu.se/en",
          },
        ],
        sameAs: [
          "https://github.com/p10ns11y",
          "https://www.linkedin.com/in/sathyam-peram/",
          "https://x.com/Peramanathan",
        ],
        knowsAbout: [
          "TypeScript",
          "JavaScript",
          "React",
          "Next.js",
          "Node.js",
          "Python",
          "Rust",
          "Tauri",
          "WebAssembly",
          "Zod",
          "OpenAPI",
          "JSON Schema",
          "Streaming JSON validation",
          "LLM tool calls",
          "LLM tooling",
          "AI/SI agentic workflows",
          "Agent harnesses",
          "Agent skills and plugins",
          "Model Context Protocol",
          "Agent memory",
          "Evals",
          "SQLite",
          "PostgreSQL",
          "MySQL",
          "MongoDB",
          {
            "@type": "Thing",
            name: "GraphQL",
            description:
              "Familiar from hobby projects and evaluated in his thesis on saving network energy",
          },
          "Public API design",
          "CRM integrations",
          "Playwright",
          "Test-driven development",
          "CI/CD",
          "Supply-chain security",
          "SLSA provenance",
          "Accessibility (WCAG)",
          "Energy-efficient mobile IoT",
        ],
        description:
          "Senior Product and Systems Engineer in Stockholm, working on AI/SI agentic workflows, with over nine years shipping web products, public APIs and integrations in TypeScript, React and Node.js. Maintainer of adaptate; EU work authorised, no sponsorship needed; can start within two weeks of an offer.",
        subjectOf: [
          { "@id": `${origin}/#adaptate` },
          { "@id": `${origin}/#paper-2017` },
          { "@id": `${origin}/#paper-2015` },
        ],
        mainEntityOfPage: `${origin}/llms.txt`,
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${origin}/#adaptate`,
        name: "adaptate",
        codeRepository: "https://github.com/p10ns11y/adaptate",
        url: "https://adaptate-site.vercel.app",
        programmingLanguage: "TypeScript",
        author: { "@id": personId },
      },
      {
        "@type": "ScholarlyArticle",
        "@id": `${origin}/#paper-2017`,
        name: "Profiling Energy Efficiency and Data Communications for Mobile Internet of Things",
        url: "https://doi.org/10.1155/2017/6562915",
        datePublished: "2017-11-07",
        author: { "@id": personId },
      },
      {
        "@type": "ScholarlyArticle",
        "@id": `${origin}/#paper-2015`,
        name: "Energy Efficiency as an Orchestration Service for Mobile Internet of Things",
        url: "https://doi.org/10.1109/CloudCom.2015.90",
        datePublished: "2015",
        author: { "@id": personId },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify of a local object
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
