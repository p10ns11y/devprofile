import type { GhcardsEmbedPart } from "./types";

export const DEFAULT_USERNAME = "p10ns11y";

export const svgResponseHeaders = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
} as const;

/** README segment embeds — discourage GitHub Camo long-lived caching. */
export const svgSegmentHeaders = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;

export function parseIndex(raw: string | null): number | null {
  if (raw === null || raw === "") return null;
  const index = parseInt(raw, 10);
  if (!Number.isFinite(index) || index < 0) return null;
  return index;
}

export function parseLimit(raw: string | null, fallback: number, max: number): number {
  return Math.min(parseInt(raw || String(fallback), 10), max);
}

export function parsePart(raw: string | null): GhcardsEmbedPart | null {
  if (raw === "header" || raw === "row" || raw === "footer" || raw === "full") return raw;
  return null;
}
