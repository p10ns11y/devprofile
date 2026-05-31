/**
 * Simulates Vercel Lambda: ___next_launcher.cjs require()s a server page chunk
 * without .next/package.json in the bundle.
 *
 * Usage: node scripts/verify-vercel-esm-resolution.mjs
 * Run after `pnpm build`. Does not modify package.json.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagePath = path.join(root, ".next/server/app/x/page.js");
const nextPkgPath = path.join(root, ".next/package.json");

if (!fs.existsSync(pagePath)) {
  console.error("Missing", pagePath, "— run pnpm build first");
  process.exit(1);
}

/** @returns {string} */
function classifyRequireError(err) {
  const msg = err.message ?? "";
  if (err.code === "ERR_REQUIRE_ESM") return "ERR_REQUIRE_ESM";
  if (msg.includes("require is not defined in ES module scope")) {
    return "ESM-scope (page.js parsed as ESM)";
  }
  if (err.code === "MODULE_NOT_FOUND") return "MODULE_NOT_FOUND (CJS load started)";
  return err.code ?? msg.split("\n")[0];
}

/**
 * @param {string} label
 * @param {{ typeModule: boolean; includeNextPkg: boolean }} opts
 */
function tryRequire(label, { typeModule, includeNextPkg }) {
  const sandbox = fs.mkdtempSync(path.join(root, ".tmp-esm-verify-"));
  const sandboxPkg = path.join(sandbox, "package.json");
  const sandboxNextPkg = path.join(sandbox, ".next", "package.json");
  const sandboxPage = path.join(sandbox, ".next/server/app/x/page.js");
  const launcher = path.join(sandbox, "___next_launcher.cjs");

  fs.mkdirSync(path.dirname(sandboxPage), { recursive: true });
  fs.writeFileSync(sandboxPkg, JSON.stringify(typeModule ? { type: "module" } : {}, null, 2));
  fs.writeFileSync(launcher, "");
  fs.copyFileSync(pagePath, sandboxPage);
  if (includeNextPkg) {
    fs.mkdirSync(path.dirname(sandboxNextPkg), { recursive: true });
    fs.copyFileSync(nextPkgPath, sandboxNextPkg);
  }

  const req = createRequire(launcher);
  let result;
  try {
    req(sandboxPage);
    result = "require-ok";
  } catch (e) {
    result = classifyRequireError(e);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }

  console.log(`${label}: ${result}`);
}

tryRequire("WITH type:module, WITHOUT .next/package.json (Vercel-broken)", {
  typeModule: true,
  includeNextPkg: false,
});
tryRequire("WITHOUT type:module, WITHOUT .next/package.json (fix)", {
  typeModule: false,
  includeNextPkg: false,
});
tryRequire("WITH type:module, WITH .next/package.json (local next start)", {
  typeModule: true,
  includeNextPkg: true,
});
