import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function runCheck(dir) {
  return spawnSync("node", ["scripts/check-cv-drift.mjs"], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env },
  });
}

function expectFail(result, label) {
  if (result.status === 0) fail(`${label}: drift check passed, but this mutation must fail`);
  console.log(`OK mutation caught: ${label}`);
  const first = (result.stderr || result.stdout || "").trim().split("\n")[0];
  if (first) console.log(`  ${first}`);
}

function expectPass(result, label) {
  if (result.status !== 0) {
    fail(`${label}: drift check failed, but this site-only change must pass\n${result.stderr || result.stdout}`);
  }
  console.log(`OK mutation ignored: ${label}`);
}

const dir = mkdtempSync(join(tmpdir(), "cv-drift-mut-"));
try {
  mkdirSync(join(dir, "src/data"), { recursive: true });
  mkdirSync(join(dir, "scripts"), { recursive: true });
  mkdirSync(join(dir, "public"), { recursive: true });
  mkdirSync(join(dir, "scripts/fixtures"), { recursive: true });
  cpSync(join(repo, "src/data/cvdata.json"), join(dir, "src/data/cvdata.json"));
  cpSync(join(repo, "scripts/check-cv-drift.mjs"), join(dir, "scripts/check-cv-drift.mjs"));
  cpSync(join(repo, "scripts/typst-from-canonical.mjs"), join(dir, "scripts/typst-from-canonical.mjs"));
  cpSync(join(repo, "public/cv.pdf"), join(dir, "public/cv.pdf"));
  const stale = join(repo, "scripts/fixtures/stale-cv.pdf");
  cpSync(stale, join(dir, "scripts/fixtures/stale-cv.pdf"));
  const git = (args) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  if (git(["init"]).status !== 0) fail("git init failed");
  git(["add", "src/data/cvdata.json", "public/cv.pdf", "scripts"]);
  const committed = git(["-c", "user.name=mut", "-c", "user.email=mut@example.com", "commit", "-m", "base"]);
  if (committed.status !== 0) fail(`git commit failed: ${committed.stderr}`);

  const restore = () => {
    writeFileSync(join(dir, "src/data/cvdata.json"), readFileSync(join(repo, "src/data/cvdata.json")));
    cpSync(join(repo, "public/cv.pdf"), join(dir, "public/cv.pdf"));
  };

  const c1 = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  c1.profile = `${c1.profile} MUTATED_SUMMARY_SENTINEL`;
  writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(c1, null, 2)}\n`);
  expectFail(runCheck(dir), "change summary");
  restore();

  cpSync(stale, join(dir, "public/cv.pdf"));
  expectFail(runCheck(dir), "swap in a stale typst PDF");
  restore();

  const c3 = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  const oneflow = (c3.work_experience || []).find(
    (job) => (job.company || "").includes("Oneflow") && job.title === "Senior Software Engineer",
  );
  if (!oneflow?.pdf_bullets?.[0]) fail("missing Oneflow senior pdf_bullets to mutate");
  const first = oneflow.pdf_bullets[0];
  if (typeof first === "string") oneflow.pdf_bullets[0] = `${first} MUTATED_ONEFLOW_BULLET`;
  else oneflow.pdf_bullets[0] = { ...first, text: `${first.text ?? ""} MUTATED_ONEFLOW_BULLET` };
  writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(c3, null, 2)}\n`);
  expectFail(runCheck(dir), "change a Oneflow pdf_bullet");
  restore();

  const cSite = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  const siteJob = (cSite.work_experience || []).find(
    (job) => (job.company || "").includes("Oneflow") && job.title === "Senior Software Engineer",
  );
  if (!siteJob?.responsibilities?.[0]) fail("missing Oneflow senior site bullet to mutate");
  siteJob.responsibilities[0] = `${siteJob.responsibilities[0]} MUTATED_SITE_ONLY_BULLET`;
  writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(cSite, null, 2)}\n`);
  expectPass(runCheck(dir), "change a Oneflow site responsibility");
  restore();

  const c4 = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  if (!c4.cv_pdf?.experience?.[0]?.dates) fail("missing typst experience date to mutate");
  c4.cv_pdf.experience[0].dates = "Jan 1999 – Dec 1999";
  writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(c4, null, 2)}\n`);
  expectFail(runCheck(dir), "change a typst cv_pdf date");
  restore();

  const c5 = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  c5.cv_pdf.experience = [...(c5.cv_pdf.experience ?? []), { title: "Unmapped role", dates: "Jan 2000 – Dec 2000", items: [] }];
  writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(c5, null, 2)}\n`);
  expectFail(runCheck(dir), "add a typst experience entry with no work_experience row");
  restore();

  const cTitle = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  if (!cTitle.cv_pdf?.experience?.[0]) fail("missing typst experience entry to mutate title/org");
  cTitle.cv_pdf.experience[0].title = "Principal Staff Engineer";
  cTitle.cv_pdf.experience[0].org = "Google";
  writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(cTitle, null, 2)}\n`);
  expectFail(runCheck(dir), "Principal Staff Engineer – Google");
  restore();

  const c6 = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  if (c6.contact?.email && c6.cv_pdf?.contact_line) {
    for (const part of c6.cv_pdf.contact_line) {
      if (typeof part?.text === "string" && part.text.includes(c6.contact.email)) {
        part.text = part.text.replace(c6.contact.email, "mutated@example.com");
      }
      if (typeof part?.href === "string" && part.href.includes(c6.contact.email)) {
        part.href = part.href.replace(c6.contact.email, "mutated@example.com");
      }
    }
    writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(c6, null, 2)}\n`);
    expectFail(runCheck(dir), "change contact_line email away from contact.email");
  } else {
    fail("missing contact.email or contact_line to mutate");
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
console.log("OK cv drift mutations (summary, stale PDF, pdf_bullet, typst date, unmapped entry, Principal Staff Engineer – Google, contact email)");
