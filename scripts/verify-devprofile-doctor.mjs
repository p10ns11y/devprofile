#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const braveBetaPath = process.env.BRAVE_BETA_PATH ?? "/usr/bin/brave-browser-beta";
const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const featuresDir = join(repoRoot, ".cursor/skills/verify-devprofile/features");

function parsePath(markdown, sourceFile) {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    throw new Error(`${sourceFile}: missing YAML frontmatter`);
  }
  const pathLine = frontmatterMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("path:"));
  if (!pathLine) {
    throw new Error(`${sourceFile}: frontmatter needs path`);
  }
  const path = pathLine.slice("path:".length).trim();
  if (!path.startsWith("/")) {
    throw new Error(`${sourceFile}: path must start with /`);
  }
  return path;
}

const features = [];
let featureMapError = null;
try {
  const pathsSeen = new Map();
  for (const fileName of readdirSync(featuresDir)) {
    if (fileName === "README.md" || !fileName.endsWith(".md")) {
      continue;
    }
    const sourceFile = join(featuresDir, fileName);
    const path = parsePath(readFileSync(sourceFile, "utf8"), sourceFile);
    if (pathsSeen.has(path)) {
      throw new Error(`duplicate path ${path}`);
    }
    pathsSeen.set(path, sourceFile);
    features.push({ path, file: sourceFile });
  }
} catch (error) {
  featureMapError = error instanceof Error ? error.message : String(error);
}

let originReachable = false;
try {
  const response = await fetch(origin, { method: "HEAD", redirect: "manual" });
  originReachable = response.status < 500;
} catch {
  originReachable = false;
}

const report = {
  ok: existsSync(braveBetaPath) && featureMapError === null,
  braveBetaPath,
  braveBetaInstalled: existsSync(braveBetaPath),
  origin,
  originReachable,
  featureMapError,
  features,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
