#!/usr/bin/env node
/**
 * workspaceOpen hook: resolve Cursor plugin paths from .ide/profile.json
 * stdout: { "pluginPaths": ["<absolute>", ...] }
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root =
  process.env.CURSOR_PROJECT_DIR ??
  join(dirname(fileURLToPath(import.meta.url)), '..');

const profilePath = join(root, '.ide', 'profile.json');
if (!existsSync(profilePath)) {
  process.stdout.write(JSON.stringify({ pluginPaths: [] }));
  process.exit(0);
}

const profile = JSON.parse(readFileSync(profilePath, 'utf8'));
const cursorHome = process.env.CURSOR_HOME ?? join(process.env.HOME, '.cursor');
const plugins = profile.cursor?.plugins ?? [];
const pluginPaths = [];

for (const entry of plugins) {
  const publisher = entry.publisher ?? 'cursor-public';
  const name = entry.name;
  if (!name) continue;

  const cacheDir = join(cursorHome, 'plugins', 'cache', publisher, name);
  if (!existsSync(cacheDir)) {
    if (!entry.optional) {
      console.error(
        `load-workspace-plugins: missing plugin cache ${publisher}/${name}`,
      );
    }
    continue;
  }

  const hashes = readdirSync(cacheDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const hash = hashes.at(-1);
  if (!hash) continue;

  const abs = resolve(join(cacheDir, hash));
  if (existsSync(join(abs, '.cursor-plugin', 'plugin.json'))) {
    pluginPaths.push(abs);
  }
}

process.stdout.write(JSON.stringify({ pluginPaths }));
