#!/usr/bin/env node
/**
 * Copies client cache module to public/ for static HTML + service worker.
 * Canonical: src/lib/github/dashboard-cache-client.js
 */
import { copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src/lib/github/dashboard-cache-client.js");
const dest = join(root, "public/github-dashboard-cache.js");

copyFileSync(src, dest);
console.log("[sync] public/github-dashboard-cache.js ← dashboard-cache-client.js");
