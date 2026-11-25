import { getMetadataBase } from "@/lib/site-url";

export function PersonJsonLd() {
  const origin = getMetadataBase().origin;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${origin}/#person`,
    name: "Peramanathan Sathyamoorthy",
    givenName: "Peramanathan",
    familyName: "Sathyamoorthy",
    jobTitle: "Senior Fullstack Engineer and Product Engineer",
    url: `${origin}/`,
    email: "mailto:sathyam.peram@gmail.com",
    nationality: { "@type": "Country", name: "Sweden" },
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
      "https://www.npmjs.com/package/@adaptate/core",
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
      "Agent harnesses",
      "Agent skills and plugins",
      "Model Context Protocol",
      "Agent memory",
      "Evals",
      "SQLite",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "GraphQL",
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
      "Senior Fullstack Engineer and Product Engineer in Stockholm with over nine years of work on web products, public APIs, integrations and developer tooling in TypeScript, React and Node.js, plus Python and Rust. At Oneflow (2017 to 2024) he built the Integration Team, ran the public API and CRM integrations, led the engineering team, set up Playwright end-to-end testing and led a TypeScript migration. Since December 2024, in Independent AI/SI product and systems engineering (agentic workflows), he has shipped adaptate on npm (one Zod or OpenAPI schema turned into per-screen views, plus validation of streaming LLM tool-call JSON; version 2.4.2 with SLSA provenance), kanithanj.ai (Tauri, Rust, React, SQLite), Ensembly (a Rust kernel that gives several agent harnesses one ledger and one approval flow) and agent plugins and skills for Grok Build, Cursor and Claude Code. His 2015 and 2017 research on energy-efficient mobile IoT argued that the cost of the next useful observation must fall while decision quality rises; he applies the same rule to agent context and memory. He builds tools that save time, enforces rules with tooling, verifies before irreversible acts and credits the work he builds on. EU work authorised, no sponsorship needed; can start within two weeks of an offer.",
    subjectOf: [
      {
        "@type": "ScholarlyArticle",
        name: "Profiling Energy Efficiency and Data Communications for Mobile Internet of Things",
        url: "https://doi.org/10.1155/2017/6562915",
        datePublished: "2017-11-07",
      },
      {
        "@type": "ScholarlyArticle",
        name: "Energy Efficiency as a Orchestration Service for the Mobile Internet of Things",
        url: "https://doi.org/10.1109/CloudCom.2015.90",
        datePublished: "2015",
      },
    ],
    mainEntityOfPage: `${origin}/llms.txt`,
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify of a local object
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
