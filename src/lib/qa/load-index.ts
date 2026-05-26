import { readFileSync } from "fs";
import { join } from "path";
import type { QAIndex } from "./types";

let cachedIndex: QAIndex | null = null;

/** Load prebuilt qa-index.json (server-only). */
export function loadQAIndex(): QAIndex {
  if (cachedIndex) return cachedIndex;

  const indexPath = join(process.cwd(), "src/data/qa-index.json");
  const raw = readFileSync(indexPath, "utf8");
  cachedIndex = JSON.parse(raw) as QAIndex;
  return cachedIndex;
}

/** Clear cached index (tests). */
export function clearQAIndexCache(): void {
  cachedIndex = null;
}
