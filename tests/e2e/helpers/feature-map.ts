import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type FeatureEntry = {
  readonly path: string;
  readonly sourceFile: string;
};

export type LoadFeatureMapOptions = {
  readonly featuresDir?: string;
  readonly onlyPath?: string;
};

export type FeatureFrontmatter = {
  readonly path: string;
};

const defaultFeaturesDir = join(process.cwd(), ".cursor/skills/verify-devprofile/features");

export function parseFeatureFrontmatter(markdown: string): FeatureFrontmatter {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    throw new Error("feature file is missing YAML frontmatter with path");
  }
  const pathLine = frontmatterMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("path:"));
  if (!pathLine) {
    throw new Error("feature frontmatter must include path");
  }
  const path = pathLine.slice("path:".length).trim();
  if (!path.startsWith("/")) {
    throw new Error(`feature path must start with / (got ${path})`);
  }
  return { path };
}

export function loadFeatureMap(options: LoadFeatureMapOptions = {}): FeatureEntry[] {
  const featuresDir = options.featuresDir ?? defaultFeaturesDir;
  const onlyPath = options.onlyPath ?? process.env.VERIFY_FEATURE;
  const entries: FeatureEntry[] = [];
  const pathsSeen = new Map<string, string>();

  for (const fileName of readdirSync(featuresDir)) {
    if (fileName === "README.md" || !fileName.endsWith(".md")) {
      continue;
    }
    const sourceFile = join(featuresDir, fileName);
    const markdown = readFileSync(sourceFile, "utf8");
    const { path } = parseFeatureFrontmatter(markdown);
    const previousFile = pathsSeen.get(path);
    if (previousFile) {
      throw new Error(`duplicate feature path ${path} in ${previousFile} and ${sourceFile}`);
    }
    pathsSeen.set(path, sourceFile);
    entries.push({ path, sourceFile });
  }

  entries.sort((left, right) => left.path.localeCompare(right.path));

  if (onlyPath) {
    return entries.filter((entry) => entry.path === onlyPath);
  }
  return entries;
}
