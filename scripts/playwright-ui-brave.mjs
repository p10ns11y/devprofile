#!/usr/bin/env node
/**
 * Playwright UI without installing Playwright Chromium:
 * - Test browsers: Brave Beta (playwright.config.ts launchOptions)
 * - UI panel: opened explicitly via brave-browser-beta (not xdg/default)
 *
 * Default `playwright test --ui` launches an embedded Chromium shell (requires
 * `playwright install chromium`). This script avoids that with --ui-host/--ui-port.
 */
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

const brave = process.env.BRAVE_BETA_PATH ?? "/usr/bin/brave-browser-beta";
const host = process.env.PLAYWRIGHT_UI_HOST ?? "127.0.0.1";
const port = process.env.PLAYWRIGHT_UI_PORT ?? "9323";
const skipOpen = process.env.PLAYWRIGHT_UI_NO_OPEN === "1";

if (!existsSync(brave)) {
  console.error(`Brave Beta not found at ${brave}. Set BRAVE_BETA_PATH or install Brave Beta.`);
  process.exit(1);
}

const url = `http://${host}:${port}`;

function openUiInBraveBeta() {
  const opener = spawn(brave, [url], { detached: true, stdio: "ignore" });
  opener.unref();
  console.log(`Opened Playwright UI in Brave Beta:\n  ${url}\n`);
}

function maybeOpenUi(chunk) {
  if (skipOpen || opened) return;
  if (chunk.toString().includes("Listening on")) {
    opened = true;
    openUiInBraveBeta();
  }
}

let opened = false;

console.log(
  `Playwright UI at ${url}\n` +
    `  Panel: Brave Beta (${brave})${skipOpen ? " — auto-open disabled (PLAYWRIGHT_UI_NO_OPEN=1)" : ""}\n` +
    `  Test runs: same Brave Beta (playwright.config.ts launchOptions).\n`
);

const child = spawn(
  "pnpm",
  ["exec", "playwright", "test", "--ui", `--ui-host=${host}`, `--ui-port=${port}`, ...process.argv.slice(2)],
  {
    stdio: ["inherit", "pipe", "pipe"],
    env: {
      ...process.env,
      PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: brave,
    },
  }
);

child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  maybeOpenUi(chunk);
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  maybeOpenUi(chunk);
});

child.on("exit", (code) => process.exit(code ?? 1));
