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

const dir = mkdtempSync(join(tmpdir(), "cv-drift-mut-"));
try {
  mkdirSync(join(dir, "src/data"), { recursive: true });
  mkdirSync(join(dir, "scripts"), { recursive: true });
  mkdirSync(join(dir, "public"), { recursive: true });
  cpSync(join(repo, "src/data/cvdata.json"), join(dir, "src/data/cvdata.json"));
  cpSync(join(repo, "scripts/check-cv-drift.mjs"), join(dir, "scripts/check-cv-drift.mjs"));
  cpSync(join(repo, "scripts/typst-from-canonical.mjs"), join(dir, "scripts/typst-from-canonical.mjs"));
  cpSync(join(repo, "public/cv.pdf"), join(dir, "public/cv.pdf"));
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

  writeFileSync(join(dir, "public/cv.pdf"), "not-a-real-pdf\n");
  expectFail(runCheck(dir), "swap in a stale cv.pdf");
  restore();

  const c3 = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  const oneflow = (c3.work_experience || []).find(
    (job) => (job.company || "").includes("Oneflow") && job.title === "Senior Software Engineer",
  );
  if (!oneflow?.responsibilities?.[0]) fail("missing Oneflow senior bullet to mutate");
  oneflow.responsibilities[0] = `${oneflow.responsibilities[0]} MUTATED_ONEFLOW_BULLET`;
  writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(c3, null, 2)}\n`);
  expectFail(runCheck(dir), "change a Oneflow bullet");
  restore();

  const c4 = JSON.parse(readFileSync(join(dir, "src/data/cvdata.json"), "utf8"));
  if (!c4.cv_pdf?.experience?.[0]?.dates) fail("missing typst experience date to mutate");
  c4.cv_pdf.experience[0].dates = "Jan 1999 – Dec 1999";
  writeFileSync(join(dir, "src/data/cvdata.json"), `${JSON.stringify(c4, null, 2)}\n`);
  expectFail(runCheck(dir), "change a typst cv_pdf date");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
console.log("OK cv drift mutations (summary, stale PDF, Oneflow bullet, typst date)");
