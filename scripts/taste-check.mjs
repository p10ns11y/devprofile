#!/usr/bin/env node
/**
 * Post-LCV taste gate: fail if findings JSON has must-show failures.
 * Run after `pnpm lcv:probe` or pass LCV_OUT=path/to/findings.json
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const findingsPath = process.env.LCV_OUT ?? join(root, "artifacts/lcv/findings.json");

if (!existsSync(findingsPath)) {
  console.error(`Missing LCV findings: ${findingsPath}. Run pnpm lcv:probe first.`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(findingsPath, "utf8"));
const findings = Array.isArray(report.findings) ? report.findings : report;
const fails = findings.filter((f) => f.fail === true);

if (fails.length > 0) {
  console.error(`LCV taste gate: ${fails.length} fail(s)`);
  for (const f of fails.slice(0, 20)) {
    console.error(
      `  [${f.kind ?? "unknown"}] ${f.path ?? ""} @ ${f.viewport ?? ""} — ${f.sel ?? f.id ?? ""}`
    );
  }
  process.exit(1);
}

console.log(`LCV taste gate: OK (${findings.length} finding(s), 0 fail)`);
