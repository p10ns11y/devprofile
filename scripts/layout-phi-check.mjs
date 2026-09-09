#!/usr/bin/env node
/**
 * Cheap φ ratio lint — flags hire CSS grid columns without φ or named exceptions.
 * Document new exceptions in LAYOUT.md before adding to ALLOWED.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(root, "src/styles/hire-phi-flow.css");
const css = readFileSync(cssPath, "utf8");

const ALLOWED = [
  /1\.618fr\s+1fr/,
  /1fr\s+1\.618fr/,
  /1fr\s+1fr/,
  /grid-template-columns:\s*1fr;/,
  /repeat\(auto-fit,\s*minmax\(/,
];

const lines = css.split("\n");
const hits = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.includes("grid-template-columns")) continue;
  const allowed = ALLOWED.some((re) => re.test(line));
  if (!allowed) {
    hits.push({ line: i + 1, text: line.trim() });
  }
}

if (hits.length > 0) {
  console.error("layout:phi-check — undocumented grid-template-columns:");
  for (const h of hits) {
    console.error(`  L${h.line}: ${h.text}`);
  }
  console.error("Add named exception to LAYOUT.md or use φ tracks.");
  process.exit(1);
}

console.log("layout:phi-check — OK");
