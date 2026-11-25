import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const cvdata = JSON.parse(readFileSync(join(repo, "src/data/cvdata.json"), "utf8"));
const email = cvdata.contact?.email ?? "";
const markers = [
  cvdata.name,
  cvdata.landing.role,
  email,
  "EU work",
  "Oneflow",
  "TypeScript",
  "two weeks",
  "Adaptate",
  "Began as a private desktop app I use daily and is now heading to public use once fully actualized.",
  "Ensembly",
  "Uppsala",
  "Playwright",
  "Kadhir Mohideen",
];
if (markers.length !== 13 || markers.some((row) => !row)) {
  console.error("expected 13 non-empty markers from cvdata");
  process.exit(1);
}
const out = process.argv[2] || join(repo, "public/cv-ats-markers.txt");
writeFileSync(out, `${markers.join("\n")}\n`);
console.log(out);
