import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getProjectWalkthrough } from "@/data/project-walkthroughs";
import { QA_EVIDENCE_PAGES, type QaEvidencePageLink } from "./evidence-pages";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");

function resolveSrcImport(importPath: string): string | null {
  const base = path.join(REPO_ROOT, "src", importPath);
  const candidates = [
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function collectImportedSources(entryFile: string, seen = new Set<string>()): string[] {
  if (seen.has(entryFile) || seen.size > 48) {
    return [];
  }
  seen.add(entryFile);

  const files = [entryFile];
  const content = readFileSync(entryFile, "utf8");
  const aliasImportPattern = /from\s+["']@\/([^"']+)["']/g;
  const relativeImportPattern = /from\s+["'](\.[^"']+)["']/g;

  for (const match of content.matchAll(aliasImportPattern)) {
    const resolved = resolveSrcImport(match[1]);
    if (resolved) {
      files.push(...collectImportedSources(resolved, seen));
    }
  }

  for (const match of content.matchAll(relativeImportPattern)) {
    const resolved = resolveRelativeImport(entryFile, match[1]);
    if (resolved) {
      files.push(...collectImportedSources(resolved, seen));
    }
  }

  return files;
}

function resolveRelativeImport(fromFile: string, importPath: string): string | null {
  const base = path.resolve(path.dirname(fromFile), importPath);
  const candidates = [
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function routePageFile(urlPath: string): string {
  if (urlPath === "/") {
    return path.join(REPO_ROOT, "src/app/page.tsx");
  }

  const segments = urlPath.split("/").filter(Boolean);
  if (segments[0] === "shipped" && segments.length === 2) {
    return path.join(REPO_ROOT, "src/app/shipped/[slug]/page.tsx");
  }

  return path.join(REPO_ROOT, "src/app", ...segments, "page.tsx");
}

function anchorPattern(anchor: string): RegExp {
  const escaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bid=(["'{\\\`])${escaped}\\1|\\bid=\\{["'\`]${escaped}["'\`]\\}`);
}

function anchorExistsInSources(anchor: string, sources: readonly string[]): boolean {
  const pattern = anchorPattern(anchor);
  return sources.some((file) => pattern.test(readFileSync(file, "utf8")));
}

function validateShippedAnchor(urlPath: string, anchor: string): string | null {
  const slug = urlPath.split("/")[2];
  if (!slug) {
    return `Missing shipped slug in path ${urlPath}`;
  }

  const project = getProjectWalkthrough(slug);
  if (!project) {
    return `Unknown shipped slug "${slug}" for ${urlPath}`;
  }

  if (!anchor.startsWith("section-")) {
    return `Shipped anchor "${anchor}" must use section-* ids`;
  }

  const sectionId = anchor.slice("section-".length);
  if (!project.sections.some((section) => section.id === sectionId)) {
    return `Shipped section "${sectionId}" missing in walkthrough data for ${urlPath}`;
  }

  const pageFile = routePageFile(urlPath);
  if (!existsSync(pageFile)) {
    return `Route file missing for ${urlPath}`;
  }

  const templatePattern = /id=\{`section-\$\{section\.id\}`\}/;
  if (!templatePattern.test(readFileSync(pageFile, "utf8"))) {
    return `Shipped page template no longer renders section-* anchors`;
  }

  return null;
}

export function validateEvidencePageLink(link: QaEvidencePageLink): string | null {
  const pageFile = routePageFile(link.path);
  if (!existsSync(pageFile)) {
    return `Route file missing for ${link.path} (${path.relative(REPO_ROOT, pageFile)})`;
  }

  if (!link.anchor) {
    return null;
  }

  if (link.path.startsWith("/shipped/") && link.path !== "/shipped") {
    return validateShippedAnchor(link.path, link.anchor);
  }

  const sources = collectImportedSources(pageFile);
  if (!anchorExistsInSources(link.anchor, sources)) {
    return `Anchor "#${link.anchor}" not found in source for ${link.path}`;
  }

  return null;
}

export function validateEvidencePageMap(
  links: readonly QaEvidencePageLink[] = QA_EVIDENCE_PAGES
): void {
  const failures = links
    .map((link) => validateEvidencePageLink(link))
    .filter((message): message is string => message !== null);

  if (failures.length > 0) {
    throw new Error(`QA evidence page map is invalid:\n- ${failures.join("\n- ")}`);
  }
}
