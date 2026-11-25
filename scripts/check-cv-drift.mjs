import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const cvdata = JSON.parse(readFileSync(join(repo, "src/data/cvdata.json"), "utf8"));
const pdf = join(repo, "public/cv.pdf");
const fails = [];

if (!cvdata.cv_pdf) fails.push("cvdata.cv_pdf is missing");
if (cvdata.cv_pdf?.summary !== cvdata.profile) fails.push("cv_pdf.summary drifts from profile");
if (cvdata.cv_pdf?.headline !== cvdata.landing?.role) fails.push("cv_pdf.headline drifts from landing.role");
if (cvdata.cv_pdf?.name !== cvdata.name) fails.push("cv_pdf.name drifts from name");

const line = "Kanithanj began as a private desktop app he uses daily and is now heading to public use once fully actualized.";
const indie = (cvdata.work_experience || []).find((job) => job.kind === "independent_work") || {};
const bullets = (indie.responsibilities || []).join(" ");
if (!bullets.includes(line)) fails.push("independent work_experience is missing the Kanithanj public-use line");
const typstKanithanj = JSON.stringify(cvdata.cv_pdf?.independent || "");
if (!typstKanithanj.includes(line)) fails.push("cv_pdf independent section is missing the Kanithanj public-use line");

if (!existsSync(pdf)) fails.push("public/cv.pdf is missing; run prebuild/generate-pdf");
else {
  const text = spawnSync("pdftotext", [pdf, "-"], { encoding: "utf8" });
  if (text.status !== 0) fails.push(`pdftotext failed: ${text.stderr}`);
  const typo = (s) => s.replace(/\s+/g, " ").replace(/'/g, "’");
  const flat = typo(text.stdout || "");
  const needed = [
    cvdata.name,
    cvdata.landing.role,
    cvdata.profile,
    line,
    "Ensembly",
    "Adaptate",
    "Oneflow",
    cvdata.current_role,
  ];
  for (const marker of needed) {
    if (!flat.includes(typo(marker))) {
      fails.push(`generated PDF is missing cvdata text: ${marker.slice(0, 80)}`);
    }
  }
  if (/\boperator kernel\b/i.test(flat) || /ran the public API/i.test(flat) || /Rust agent kernel/i.test(flat)) {
    fails.push("generated PDF still has retired typst overclaims");
  }
}

if (fails.length) {
  for (const row of fails) console.error(`FAIL: ${row}`);
  process.exit(1);
}
console.log("OK cvdata and typst PDF agree on headline, summary, role, Kanithanj line, and Ensembly");
