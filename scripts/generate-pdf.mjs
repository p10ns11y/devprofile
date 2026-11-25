import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const pkgRoot = dirname(require.resolve("kanithanj-cv/package.json"));
const script = join(pkgRoot, "scripts/generate-apply-cv.tsx");
const out = join(repo, "public/cv.pdf");
const cvdata = join(repo, "src/data/cvdata.json");
const result = spawnSync("bun", [script, "--master", "--out", out], {
  cwd: pkgRoot,
  stdio: "inherit",
  env: { ...process.env, CVDATA_SRC: cvdata },
});
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
