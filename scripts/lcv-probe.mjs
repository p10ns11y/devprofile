#!/usr/bin/env node
/**
 * LCV web probe — geometry gate for verify-devprofile feature map.
 * Vendors layout-content-view from p10ns11y/plugins (see vendor/layout-content-view/).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lcvRoot = join(root, "vendor/layout-content-view");
const probe = join(lcvRoot, "scripts/probe-web.mjs");

if (!existsSync(probe)) {
  console.error("LCV probe missing. Expected:", probe);
  process.exit(1);
}

const brave =
  process.env.BRAVE_BETA_PATH ??
  ["/usr/bin/brave-browser-beta", "/usr/bin/brave-browser", "/snap/bin/brave"].find((p) =>
    existsSync(p)
  );

if (!brave) {
  console.error(
    "Brave not found. Install Brave Beta or set BRAVE_BETA_PATH. See tests/e2e/README.md."
  );
  process.exit(1);
}

const outDir = process.env.LCV_OUT_DIR ?? join(root, "artifacts/lcv");
const outFile = process.env.LCV_OUT ?? join(outDir, "findings.json");

const env = {
  ...process.env,
  BRAVE_BETA_PATH: brave,
  FEATURES_DIR: process.env.FEATURES_DIR ?? join(root, ".cursor/skills/verify-devprofile/features"),
  ORIGIN: process.env.ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  LCV_OUT: outFile,
};

const result = spawnSync(process.execPath, [probe], {
  cwd: root,
  env,
  stdio: "inherit",
});

if (result.status === 0) {
  console.log(`LCV findings: ${outFile}`);
}

process.exit(result.status ?? 1);
