import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  typo,
  compactBullet,
  typstFactMismatches,
  requiredPdfSnippets,
  independentJob,
  pdfBullets,
  typstItemText,
} from "./typst-from-canonical.mjs";

function searchKey(value) {
  return compactBullet(value);
}

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const cvdata = JSON.parse(readFileSync(join(repo, "src/data/cvdata.json"), "utf8"));
const pdf = join(repo, "public/cv.pdf");
const fails = [];
const KANITHANJ_HE =
  "Kanithanj began as a private desktop app he uses daily and is now heading to public use once fully actualized.";
const KANITHANJ_I =
  "Began as a private desktop app I use daily and is now heading to public use once fully actualized.";

fails.push(...typstFactMismatches(cvdata));

const indie = independentJob(cvdata);
const typstBullets = pdfBullets(indie).map(typstItemText).join(" ");
if (!typstBullets.includes(KANITHANJ_HE)) {
  fails.push("independent pdf_bullets is missing the Kanithanj public-use line");
}

if (!existsSync(pdf)) fails.push("public/cv.pdf is missing; run prebuild/generate-pdf");
else {
  const text = spawnSync("pdftotext", [pdf, "-"], { encoding: "utf8" });
  if (text.status !== 0) fails.push(`pdftotext failed: ${text.stderr}`);
  const flat = typo(text.stdout || "");
  const compact = compactBullet(flat);
  for (const marker of requiredPdfSnippets(cvdata)) {
    if (!compact.includes(searchKey(marker))) {
      fails.push(`generated PDF is missing cvdata text: ${typo(marker).slice(0, 80)}`);
    }
  }
  if (!compact.includes(searchKey(KANITHANJ_I))) {
    fails.push("generated PDF is missing the first-person Kanithanj line");
  }
  if (flat.includes("he uses daily")) {
    fails.push("generated PDF still renders the Kanithanj line with “he”");
  }
  if (/\boperator kernel\b/i.test(flat) || /ran the public API/i.test(flat) || /Rust agent kernel/i.test(flat)) {
    fails.push("generated PDF still has retired typst overclaims");
  }
  const keywords = cvdata.cv_pdf?.document?.keywords ?? [];
  const aisi = keywords.filter((k) => k === "AI/SI").length;
  if (aisi !== 1) fails.push(`PDF keywords should list AI/SI once, got ${aisi}`);
}

if (process.env.CV_DRIFT_SKIP_GIT !== "1") {
  const diff = spawnSync("git", ["diff", "--exit-code", "--", "public/cv.pdf"], {
    cwd: repo,
    encoding: "utf8",
  });
  if (diff.status !== 0) {
    fails.push("public/cv.pdf is stale or dirty; regenerate with SOURCE_DATE_EPOCH and commit the typst PDF");
  }
}

if (fails.length) {
  for (const row of fails) console.error(`FAIL: ${row}`);
  process.exit(1);
}
console.log("OK cvdata typst facts, pdf_bullets, dates and committed typst PDF agree");
