/**
 * Hero layout as f(content, θ, w[, h]).
 *
 * Measure text runs once (pretext-style), then layout is arithmetic:
 * wrap thresholds, column widths, and must-show boxes over a width domain.
 *
 * Honest labels:
 * - Proven: interval check that must-show marks stay inside the viewport
 *   horizontally, under the CSS model below, after splitting at the band-max
 *   discontinuity. This is a proof of the model, not of Chromium.
 * - Sampled: column geometry vs the live DOM on a width grid (see sweep / e2e).
 * - Modeled, not proven: greedy wrap line counts. The DOM uses text-wrap:
 *   balance (name) and pretty (thesis), so line counts may differ by a line
 *   while overflow still matches.
 */

export const HIRE_LAYOUT_DOMAIN = { lo: 280, hi: 3840 } as const;

export const PHI = 1.618;

export type Interval = { lo: number; hi: number };

export type HeroTheta = {
  /** Assumed root font-size, matching browser default rem. */
  remPx: number;
  insetMinPx: number;
  insetVw: number;
  insetMaxPx: number;
  bandMaxPx: number;
  splitMinContainerPx: number;
  shortSplitMinContainerPx: number;
  shortLandscapeMaxHeightPx: number;
  splitGapPx: number;
  shortSplitGapPx: number;
  phi: number;
  nameLetterSpacingEm: number;
  thesisLetterSpacingEm: number;
};

export const HIRE_HERO_THETA: HeroTheta = {
  remPx: 16,
  insetMinPx: 16,
  insetVw: 0.04,
  insetMaxPx: 24,
  bandMaxPx: 80 * 16,
  splitMinContainerPx: 40 * 16,
  shortSplitMinContainerPx: 30 * 16,
  shortLandscapeMaxHeightPx: 32 * 16,
  splitGapPx: 2.618 * 16,
  shortSplitGapPx: 1 * 16,
  phi: PHI,
  nameLetterSpacingEm: -0.02,
  thesisLetterSpacingEm: 0,
};

export type TextMeasure = (text: string) => number;

export type MeasuredRun = {
  text: string;
  width: number;
  isSpace: boolean;
};

export type PreparedText = {
  text: string;
  runs: MeasuredRun[];
};

export type HeroContent = {
  name: string;
  thesis: string;
};

export type PreparedHero = {
  name: PreparedText;
  thesis: PreparedText;
};

export type HeroMarkBox = {
  id: "name" | "thesis";
  x: number;
  width: number;
  lines: number;
};

export type HeroLayout = {
  w: number;
  h: number;
  inset: number;
  contentWidth: number;
  split: boolean;
  nameFontPx: number;
  thesisFontPx: number;
  name: HeroMarkBox;
  thesis: HeroMarkBox;
};

export type IntervalProofPart = {
  domain: Interval;
  slack: Interval;
  holds: boolean;
};

export type MustShowIntervalProof = {
  proven: boolean;
  kind: "interval";
  domain: Interval;
  parts: IntervalProofPart[];
  assumptions: string[];
  notProven: string[];
};

export function iv(lo: number, hi: number): Interval {
  return lo <= hi ? { lo, hi } : { lo: hi, hi: lo };
}

export function ivAdd(a: Interval, b: Interval): Interval {
  return { lo: a.lo + b.lo, hi: a.hi + b.hi };
}

export function ivSub(a: Interval, b: Interval): Interval {
  return { lo: a.lo - b.hi, hi: a.hi - b.lo };
}

export function ivMul(a: Interval, b: Interval): Interval {
  const xs = [a.lo * b.lo, a.lo * b.hi, a.hi * b.lo, a.hi * b.hi];
  return { lo: Math.min(...xs), hi: Math.max(...xs) };
}

export function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function prepareText(text: string, measure: TextMeasure): PreparedText {
  const parts = text.split(/(\s+)/);
  return {
    text,
    runs: parts
      .filter((part) => part.length > 0)
      .map((part) => ({
        text: part,
        width: measure(part),
        isSpace: /^\s+$/.test(part),
      })),
  };
}

export function prepareHero(content: HeroContent, measure: TextMeasure): PreparedHero {
  return {
    name: prepareText(content.name, measure),
    thesis: prepareText(content.thesis, measure),
  };
}

export function scalePrepared(prepared: PreparedText, factor: number): PreparedText {
  return {
    text: prepared.text,
    runs: prepared.runs.map((run) => ({ ...run, width: run.width * factor })),
  };
}

function applyLetterSpacing(prepared: PreparedText, letterSpacingPx: number): PreparedText {
  if (letterSpacingPx === 0) {
    return prepared;
  }
  return {
    text: prepared.text,
    runs: prepared.runs.map((run) => ({
      ...run,
      width: run.isSpace
        ? run.width
        : run.width + Math.max(0, run.text.length - 1) * letterSpacingPx,
    })),
  };
}

export function contentInset(w: number, theta: HeroTheta = HIRE_HERO_THETA): number {
  return clamp(theta.insetMinPx, theta.insetVw * w, theta.insetMaxPx);
}

export function contentWidth(w: number, theta: HeroTheta = HIRE_HERO_THETA): number {
  const band = Math.min(w, theta.bandMaxPx);
  return Math.max(0, band - 2 * contentInset(w, theta));
}

export function bandOriginX(w: number, theta: HeroTheta = HIRE_HERO_THETA): number {
  const band = Math.min(w, theta.bandMaxPx);
  return (w - band) / 2 + contentInset(w, theta);
}

export function isShortLandscape(
  w: number,
  h: number,
  theta: HeroTheta = HIRE_HERO_THETA
): boolean {
  return w > h && h <= theta.shortLandscapeMaxHeightPx;
}

export function isSplit(w: number, h: number, theta: HeroTheta = HIRE_HERO_THETA): boolean {
  const container = contentWidth(w, theta);
  if (isShortLandscape(w, h, theta)) {
    return container >= theta.shortSplitMinContainerPx;
  }
  return container >= theta.splitMinContainerPx;
}

export function splitGap(w: number, h: number, theta: HeroTheta = HIRE_HERO_THETA): number {
  return isShortLandscape(w, h, theta) ? theta.shortSplitGapPx : theta.splitGapPx;
}

export function columnWidths(
  w: number,
  h: number,
  theta: HeroTheta = HIRE_HERO_THETA
): { name: number; thesis: number; gap: number } {
  const cw = contentWidth(w, theta);
  if (!isSplit(w, h, theta)) {
    return { name: cw, thesis: cw, gap: 0 };
  }
  const gap = splitGap(w, h, theta);
  const usable = Math.max(0, cw - gap);
  const name = (usable * theta.phi) / (theta.phi + 1);
  return { name, thesis: usable - name, gap };
}

export function nameFontSizePx(w: number, h: number, theta: HeroTheta = HIRE_HERO_THETA): number {
  if (isShortLandscape(w, h, theta)) {
    return clamp(1.75 * theta.remPx, 0.045 * w, 2.75 * theta.remPx);
  }
  return clamp(2.25 * theta.remPx, 0.055 * w, 3.75 * theta.remPx);
}

export function thesisFontSizePx(w: number, h: number, theta: HeroTheta = HIRE_HERO_THETA): number {
  if (isShortLandscape(w, h, theta)) {
    return clamp(1 * theta.remPx, 0.02 * w, 1.25 * theta.remPx);
  }
  return clamp(1.125 * theta.remPx, 0.022 * w, 1.5 * theta.remPx);
}

function splitRunWidths(wordWidth: number, width: number): number[] {
  if (width <= 0) {
    return [wordWidth];
  }
  if (wordWidth <= width) {
    return [wordWidth];
  }
  const full = Math.floor(wordWidth / width);
  const rest = wordWidth - full * width;
  const pieces = Array.from({ length: full }, () => width);
  if (rest > 1e-6) {
    pieces.push(rest);
  }
  return pieces;
}

export function wrapLineCount(prepared: PreparedText, width: number): number {
  const words: Array<{ width: number }> = [];
  let buf = 0;
  let pending = false;
  for (const run of prepared.runs) {
    if (run.isSpace) {
      if (pending) {
        words.push({ width: buf });
        buf = 0;
        pending = false;
      }
      continue;
    }
    buf += run.width;
    pending = true;
  }
  if (pending) {
    words.push({ width: buf });
  }
  if (words.length === 0) {
    return 1;
  }

  const space = prepared.runs.find((run) => run.isSpace)?.width ?? 0;
  let lines = 1;
  let used = 0;
  for (const word of words) {
    for (const piece of splitRunWidths(word.width, width)) {
      if (used === 0) {
        used = piece;
        continue;
      }
      if (used + space + piece <= width + 1e-6) {
        used += space + piece;
      } else {
        lines += 1;
        used = piece;
      }
    }
  }
  return lines;
}

export function naturalWidth(prepared: PreparedText): number {
  return prepared.runs.reduce((sum, run) => sum + run.width, 0);
}

/**
 * Widths at which greedy line-count changes (the 1-line threshold first).
 * Computed from cached run widths — no further measuring.
 */
export function wrapThresholds(prepared: PreparedText): number[] {
  const words: number[] = [];
  let buf = 0;
  let pending = false;
  for (const run of prepared.runs) {
    if (run.isSpace) {
      if (pending) {
        words.push(buf);
        buf = 0;
        pending = false;
      }
      continue;
    }
    buf += run.width;
    pending = true;
  }
  if (pending) {
    words.push(buf);
  }

  const space = prepared.runs.find((run) => run.isSpace)?.width ?? 0;
  const candidates = new Set<number>();
  const total = naturalWidth(prepared);
  if (total > 0) {
    candidates.add(total);
  }
  for (let start = 0; start < words.length; start++) {
    let acc = 0;
    for (let end = start; end < words.length; end++) {
      acc += words[end] + (end > start ? space : 0);
      candidates.add(acc);
    }
  }

  const sorted = [...candidates].filter((width) => width > 0).sort((a, b) => a - b);
  const jumps: number[] = [];
  let prev = sorted.length === 0 ? 1 : wrapLineCount(prepared, sorted[0] - 1);
  for (const width of sorted) {
    const count = wrapLineCount(prepared, width);
    if (count !== prev) {
      jumps.push(width);
      prev = count;
    }
  }
  return jumps;
}

function preparedAtFont(
  prepared: PreparedText,
  fontPx: number,
  letterSpacingEm: number,
  refPx: number
): PreparedText {
  const scaled = scalePrepared(prepared, fontPx / refPx);
  return applyLetterSpacing(scaled, letterSpacingEm * fontPx);
}

/** L = f(content, θ, w) with optional height for the short-landscape split. */
export function layoutHero(
  prepared: PreparedHero,
  w: number,
  h = 812,
  theta: HeroTheta = HIRE_HERO_THETA,
  refPx = 16
): HeroLayout {
  const cols = columnWidths(w, h, theta);
  const x0 = bandOriginX(w, theta);
  const nameFontPx = nameFontSizePx(w, h, theta);
  const thesisFontPx = thesisFontSizePx(w, h, theta);
  const nameText = preparedAtFont(prepared.name, nameFontPx, theta.nameLetterSpacingEm, refPx);
  const thesisText = preparedAtFont(
    prepared.thesis,
    thesisFontPx,
    theta.thesisLetterSpacingEm,
    refPx
  );
  return {
    w,
    h,
    inset: contentInset(w, theta),
    contentWidth: contentWidth(w, theta),
    split: isSplit(w, h, theta),
    nameFontPx,
    thesisFontPx,
    name: {
      id: "name",
      x: x0,
      width: cols.name,
      lines: wrapLineCount(nameText, cols.name),
    },
    thesis: {
      id: "thesis",
      x: cols.gap > 0 ? x0 + cols.name + cols.gap : x0,
      width: cols.thesis,
      lines: wrapLineCount(thesisText, cols.thesis),
    },
  };
}

function insetOnSlice(lo: number, hi: number, theta: HeroTheta): Interval {
  return {
    lo: contentInset(lo, theta),
    hi: contentInset(hi, theta),
  };
}

/**
 * Interval check: must-show right edge ≤ w for every w in the domain.
 * Splits at bandMax where min(w, bandMax) changes slope; naive intervals
 * on the unsplit domain are too loose to prove the bound.
 */
export function proveMustShowFitsWidth(
  domain: Interval = HIRE_LAYOUT_DOMAIN,
  theta: HeroTheta = HIRE_HERO_THETA
): MustShowIntervalProof {
  const cuts = [domain.lo, theta.bandMaxPx, domain.hi]
    .filter((value) => value >= domain.lo && value <= domain.hi)
    .filter((value, index, all) => all.indexOf(value) === index)
    .sort((a, b) => a - b);

  const parts: IntervalProofPart[] = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const lo = cuts[i];
    const hi = cuts[i + 1];
    const inset = insetOnSlice(lo, hi, theta);
    let slack: Interval;
    if (hi <= theta.bandMaxPx) {
      slack = inset;
    } else {
      slack = ivAdd(iv(lo - theta.bandMaxPx, hi - theta.bandMaxPx), inset);
    }
    parts.push({
      domain: { lo, hi },
      slack,
      holds: slack.lo >= -1e-9,
    });
  }

  return {
    proven: parts.length > 0 && parts.every((part) => part.holds),
    kind: "interval",
    domain,
    parts,
    assumptions: [
      "Must-show marks (name, thesis) are block-level in columns that tile the content width.",
      "contentWidth(w) = min(w, 80rem) - 2 * clamp(1rem, 4vw, 1.5rem), with rem = 16px.",
      "overflow-wrap: anywhere and min-width: 0, so intrinsic min-width of text is 0.",
      "When split, name + gap + thesis = contentWidth, so each mark's right edge is ≤ band - inset.",
      "The domain is split at 80rem so interval arithmetic on slack stays tight enough to prove.",
    ],
    notProven: [
      "The browser's layout engine, subpixel rounding, and zoom.",
      "Vertical clip, overlap, or reading order.",
      "Line counts (DOM uses text-wrap: balance / pretty; this module uses greedy wrap).",
      "Header brand, email channel, and systems atlas — those are outside f(hero).",
      "User root font-size other than 16px (rem tokens would scale).",
    ],
  };
}
