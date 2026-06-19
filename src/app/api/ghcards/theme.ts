/** GitHub README–friendly SVG theme (light + dark via prefers-color-scheme). */

export const SVG_FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export function ghcCardStyles(): string {
  return `<style>
    :root { color-scheme: light dark; }
    text { font-family: ${SVG_FONT}; }
    .canvas { fill: #ffffff; stroke: #d0d7de; stroke-width: 1; }
    .header { fill: #f6f8fa; }
    .title { fill: #1f2328; font-weight: 700; }
    .subtitle { fill: #656d76; font-weight: 600; }
    .muted { fill: #656d76; }
    .footer { fill: #656d76; font-size: 10px; }
    .row { fill: #f6f8fa; stroke: #d0d7de; stroke-width: 1; }
    .accent { fill: #0969da; }
    .divider { stroke: #d8dee4; stroke-width: 1; }
    .star { fill: #9a6700; }
    .badge-latest { fill: #ddf4ff; }
    .badge-latest-text { fill: #0969da; font-weight: 600; }
    .badge-merged { fill: #dafbe1; }
    .badge-merged-text { fill: #116329; font-weight: 600; }
    .badge-open { fill: #ddf4ff; }
    .badge-open-text { fill: #0969da; font-weight: 600; }
    .badge-closed { fill: #ffebe9; }
    .badge-closed-text { fill: #cf222e; font-weight: 600; }
    .error-title { fill: #cf222e; font-weight: 600; }
    a.row-link { cursor: pointer; }
    a.row-link:focus { outline: none; }
    a.row-link:focus-visible .row { stroke: #0969da; stroke-width: 2; }
    @media (prefers-color-scheme: dark) {
      .canvas { fill: #0d1117; stroke: #30363d; }
      .header { fill: #161b22; }
      .title { fill: #e6edf3; }
      .subtitle { fill: #8b949e; }
      .muted { fill: #8b949e; }
      .footer { fill: #8b949e; }
      .row { fill: #161b22; stroke: #30363d; }
      .accent { fill: #4493f8; }
      .divider { stroke: #30363d; }
      .star { fill: #d4a72c; }
      .badge-latest { fill: #051d4d; }
      .badge-latest-text { fill: #4493f8; }
      .badge-merged { fill: #033a16; }
      .badge-merged-text { fill: #3fb950; }
      .badge-open { fill: #051d4d; }
      .badge-open-text { fill: #4493f8; }
      .badge-closed { fill: #3d0d0d; }
      .badge-closed-text { fill: #f85149; }
      .error-title { fill: #f85149; }
      a.row-link:focus-visible .row { stroke: #4493f8; stroke-width: 2; }
    }
  </style>`;
}

export function wrapSvg(width: number, height: number, body: string, extraDefs = ""): string {
  const defs = extraDefs ? `<defs>${extraDefs}</defs>` : "";
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${ghcCardStyles()}
    ${defs}
    <rect class="canvas" width="${width}" height="${height}" rx="12"/>
    ${body}
  </svg>`;
}

export function cardHeader(
  width: number,
  title: string,
  username: string,
  headerHeight = 56
): string {
  const safeUser = escapeXml(username);
  return `
    <rect class="header" x="1" y="1" width="${width - 2}" height="${headerHeight}" rx="11"/>
    <rect x="1" y="${headerHeight - 8}" width="${width - 2}" height="8" class="header"/>
    <rect x="1" y="1" width="4" height="${headerHeight}" rx="2" class="accent"/>
    <text x="20" y="34" class="title" font-size="16">${escapeXml(title)}</text>
    ${
      safeUser
        ? `<text x="${width - 20}" y="34" class="muted" font-size="12" text-anchor="end">@${safeUser}</text>`
        : ""
    }
  `;
}

export function cardFooter(width: number, height: number): string {
  return `<text x="20" y="${height - 12}" class="footer">Live from GitHub API · refreshes every 5 min</text>`;
}

export function prStateBadge(state: string): {
  bgClass: string;
  textClass: string;
  label: string;
} {
  if (state === "merged") {
    return { bgClass: "badge-merged", textClass: "badge-merged-text", label: "Merged" };
  }
  if (state === "open") {
    return { bgClass: "badge-open", textClass: "badge-open-text", label: "Open" };
  }
  return { bgClass: "badge-closed", textClass: "badge-closed-text", label: "Closed" };
}

export function getTimeAgo(dateString?: string): string {
  if (!dateString) return "N/A";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [s, l] of intervals) {
    const i = Math.floor(seconds / s);
    if (i >= 1) return `${i}${l} ago`;
  }
  return "just now";
}

/** Approximate truncation for SVG text (no CSS ellipsis in all README renderers). */
export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(1, maxChars - 1))}…`;
}

export function escapeXml(str: string): string {
  return str.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string
  );
}

export function githubRepoUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}

export function parseRepoPathFromApiUrl(repositoryUrl: string): string | null {
  const match = repositoryUrl.match(/\/repos\/([^/]+\/[^/]+)/);
  return match?.[1] ?? null;
}

export function githubPrUrl(repositoryUrl: string, prNumber: number): string {
  const repoPath = parseRepoPathFromApiUrl(repositoryUrl);
  if (repoPath) return `https://github.com/${repoPath}/pull/${prNumber}`;
  return `https://github.com/pull/${prNumber}`;
}

/** Wrap SVG row markup in a README-safe external link. */
export function svgExternalLink(href: string, content: string): string {
  return `<a class="row-link" href="${escapeXml(href)}" target="_blank" rel="noopener noreferrer">${content}</a>`;
}

export function errorSvg(width: number, height: number, message: string): string {
  return wrapSvg(
    width,
    height,
    `
    ${cardHeader(width, "GitHub Activity", "")}
    <text x="${width / 2}" y="${height / 2 + 8}" class="error-title" font-size="14" text-anchor="middle">${escapeXml(message)}</text>
  `
  );
}

/** Language dot colors (readable on both README themes). */
export function getLanguageColor(lang: string | null | undefined): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#ca8a04",
    Shell: "#22863a",
    Rust: "#bf741f",
    Python: "#3572A5",
    C: "#555555",
    TeX: "#3D6117",
    HTML: "#e34c26",
    CSS: "#563d7c",
  };
  return colors[lang ?? ""] ?? "#656d76";
}
