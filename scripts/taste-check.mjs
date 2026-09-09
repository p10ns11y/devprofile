#!/usr/bin/env node
/**
 * Static taste gate for the production hire surface.
 * Greps fail tells from TASTE.md / PLAN.md — does not require LCV findings.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  "src/components/hire/hire-landing.tsx",
  "src/components/hire/hire-contact.tsx",
  "src/components/hire/hire-evidence-section.tsx",
  "src/components/hire/hire-systems-graph.tsx",
  "src/app/page.tsx",
  "src/lib/hire-layout-derived.ts",
  "src/styles/hire-phi-flow.css",
];

const tells = [
  { re: /Talk instead/, why: "Talk-instead CTA on hire surface" },
  { re: /XChat/, why: "XChat label — use icon + @handle" },
  { re: /span-8|span-4|col-span-8|col-span-4/, why: "Fixed span choreography" },
  { re: /life-os/, why: "Invented graph node (not in cvdata.projects)" },
  { re: /center-then-end/, why: "center-then-end reach — pack + center-first" },
];

const hits = [];

for (const rel of files) {
  const text = readFileSync(join(root, rel), "utf8");
  for (const tell of tells) {
    if (tell.re.test(text)) {
      hits.push(`${rel}: ${tell.why}`);
    }
  }
}

const landing = readFileSync(join(root, "src/components/hire/hire-landing.tsx"), "utf8");
if (/hire-phi__interactives/.test(landing) && /layout\.proofs/.test(landing)) {
  const proofsBlock = landing.slice(
    landing.indexOf("layout.proofs"),
    landing.indexOf("hire-phi__arc-note")
  );
  if (proofsBlock.includes("interactives")) {
    hits.push("hire-landing.tsx: interactives class on proofs grid");
  }
}

const css = readFileSync(join(root, "src/styles/hire-phi-flow.css"), "utf8");
if (css.includes("@container (min-width: 28rem)")) {
  hits.push("hire-phi-flow.css: 28rem container parks hero reach on the end edge");
}
if (css.includes("@container (min-width: 20rem)")) {
  hits.push("hire-phi-flow.css: 20rem container parks evidence links on the end edge");
}
if (/\.hire-phi__channel\s*\{[^}]*space-between/.test(css)) {
  hits.push("hire-phi-flow.css: channel row uses space-between (icon/text canyon)");
}
if (/\.hire-phi__hero-reach \.hire-phi__actions\s*\{[^}]*width:\s*100%/.test(css)) {
  hits.push("hire-phi-flow.css: hero actions stretched to full width");
}
if (/\.hire-phi__hero-social-wrap\s*\{[^}]*width:\s*100%/.test(css)) {
  hits.push("hire-phi-flow.css: hero social wrap stretched to full width");
}

if (hits.length > 0) {
  console.error("taste:check — fail tells:");
  for (const hit of hits) {
    console.error(`  ${hit}`);
  }
  process.exit(1);
}

console.log("taste:check — OK");
