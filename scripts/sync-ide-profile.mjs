#!/usr/bin/env node
/**
 * Generate IDE-agnostic workspace config from .ide/profile.json
 * Outputs: .vscode/settings.json, .vscode/extensions.json, .cursor/hooks.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ideDir = join(root, ".ide");
const profile = JSON.parse(readFileSync(join(ideDir, "profile.json"), "utf8"));
const defaults = JSON.parse(readFileSync(join(ideDir, "defaults.settings.json"), "utf8"));

function listInstalledExtensionIds() {
  const extDir = join(process.env.CURSOR_HOME ?? join(homedir(), ".cursor"), "extensions");
  if (!existsSync(extDir)) return new Set();
  const ids = new Set();
  for (const folder of readdirSync(extDir)) {
    // e.g. dbaeumer.vscode-eslint-3.0.20 → dbaeumer.vscode-eslint
    const idx = folder.search(/-\d/);
    if (idx > 0) ids.add(folder.slice(0, idx));
  }
  return ids;
}

const overlayPath = join(ideDir, "profile.extensions.json");
let overlay = {};
if (existsSync(overlayPath)) {
  overlay = JSON.parse(readFileSync(overlayPath, "utf8"));
}

const installed = listInstalledExtensionIds();
const mergedOverlay = {};
for (const [extId, extSettings] of Object.entries(overlay)) {
  if (installed.has(extId)) {
    Object.assign(mergedOverlay, extSettings);
  }
}

const settings = { ...defaults, ...profile.settings, ...mergedOverlay };
const extensions = {
  recommendations: profile.extensions?.recommend ?? [],
  unwantedRecommendations: profile.extensions?.unwanted ?? [],
};

mkdirSync(join(root, ".vscode"), { recursive: true });
mkdirSync(join(root, ".cursor"), { recursive: true });

writeFileSync(join(root, ".vscode", "settings.json"), `${JSON.stringify(settings, null, 2)}\n`);
writeFileSync(join(root, ".vscode", "extensions.json"), `${JSON.stringify(extensions, null, 2)}\n`);

const hooks = {
  version: 1,
  hooks: {
    workspaceOpen: [{ command: "node scripts/load-workspace-plugins.mjs" }],
  },
};

writeFileSync(join(root, ".cursor", "hooks.json"), `${JSON.stringify(hooks, null, 2)}\n`);

console.log("Wrote .vscode/settings.json");
console.log("Wrote .vscode/extensions.json");
console.log("Wrote .cursor/hooks.json");
console.log(`Stack: ${(profile.stack ?? []).join(", ") || "(none)"}`);
console.log(
  `Extensions: ${extensions.recommendations.length} recommend, ${extensions.unwantedRecommendations.length} unwanted`
);
console.log(
  `Cursor plugins: ${(profile.cursor?.plugins ?? []).map((p) => p.name).join(", ") || "(none)"}`
);
const applied = Object.keys(overlay).filter((id) => installed.has(id));
if (applied.length) {
  console.log(`Applied settings from installed extensions: ${applied.join(", ")}`);
} else if (Object.keys(overlay).length) {
  console.log("Extension-specific settings skipped (install recommendations first, then re-sync).");
}
