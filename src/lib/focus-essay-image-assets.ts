import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { FOCUS_ESSAYS } from "@/data/focus-essays";

export type FocusEssayCardImage = {
  readonly slug: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
};

export function listFocusEssayCardImages(): readonly FocusEssayCardImage[] {
  return FOCUS_ESSAYS.map((essay) => ({
    slug: essay.slug,
    src: essay.image.src,
    width: essay.image.width,
    height: essay.image.height,
  }));
}

export function resolvePublicAssetPath(publicSrc: string): string {
  return join(process.cwd(), "public", publicSrc.replace(/^\//, ""));
}

export function assertValidUtf8Svg(publicSrc: string): void {
  const filePath = resolvePublicAssetPath(publicSrc);
  if (!existsSync(filePath)) {
    throw new Error(`${publicSrc} is missing under public/`);
  }

  const bytes = readFileSync(filePath);
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${publicSrc} is not valid UTF-8`);
  }

  const parseResult = spawnSync(
    "python3",
    ["-c", `import xml.etree.ElementTree as ET; ET.parse(${JSON.stringify(filePath)})`],
    { stdio: "pipe" }
  );
  if (parseResult.status !== 0) {
    throw new Error(`${publicSrc} is not well-formed XML`);
  }
}

export function assertFocusEssayCardCatalogMatchesSvg(
  publicSrc: string,
  width: number,
  height: number
): void {
  const filePath = resolvePublicAssetPath(publicSrc);
  const text = readFileSync(filePath, "utf8");
  const viewBoxMatch = text.match(/viewBox="0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/u);
  if (!viewBoxMatch) {
    return;
  }
  const viewBoxWidth = Math.round(Number(viewBoxMatch[1]));
  const viewBoxHeight = Math.round(Number(viewBoxMatch[2]));
  if (viewBoxWidth !== width || viewBoxHeight !== height) {
    throw new Error(
      `${publicSrc} catalog size ${width}x${height} does not match viewBox ${viewBoxWidth}x${viewBoxHeight}`
    );
  }
}
