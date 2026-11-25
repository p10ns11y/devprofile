import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveTypstView } from "./typst-from-canonical.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const pkgRoot = dirname(require.resolve("kanithanj-cv/package.json"));
const script = join(pkgRoot, "scripts/generate-apply-cv.tsx");
const out = join(repo, "public/cv.pdf");
const master = JSON.parse(readFileSync(join(repo, "src/data/cvdata.json"), "utf8"));
master.cv_pdf = deriveTypstView(master);
const cvdata = join(mkdtempSync(join(tmpdir(), "cvdata-typst-")), "cvdata.json");
writeFileSync(cvdata, `${JSON.stringify(master, null, 2)}\n`);
const result = spawnSync("bun", [script, "--master", "--out", out], {
  cwd: pkgRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    CVDATA_SRC: cvdata,
    SOURCE_DATE_EPOCH: process.env.SOURCE_DATE_EPOCH ?? "0",
  },
});
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
