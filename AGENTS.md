# Agent instructions

This repository includes **portable agent skills** under [`.agents/skills/`](.agents/skills/).

## Skills index

| When the user asks about… | Read |
|---------------------------|------|
| `pnpm audit`, npm vulnerabilities, deprecated packages, supply-chain attacks, `sfw`, install safety | [`.agents/skills/fix-dependency-security/SKILL.md`](.agents/skills/fix-dependency-security/SKILL.md) |
| `allowBuilds`, postinstall/build scripts, `strictDepBuilds`, `approve-builds`, lifecycle-script risk | [`.agents/skills/audit-allow-builds/SKILL.md`](.agents/skills/audit-allow-builds/SKILL.md) |
| Cursor/VS Code extensions, IDE plugins, editor supply-chain, MCP tooling deps | [`.agents/skills/audit-ide-dependencies/SKILL.md`](.agents/skills/audit-ide-dependencies/SKILL.md) |
| Per-project IDE settings, extension recommendations, Cursor plugin hooks | [`.agents/skills/project-ide-profile/SKILL.md`](.agents/skills/project-ide-profile/SKILL.md) |
| Upgrade, update, or bump dependencies; Next/React/TS/Tailwind majors; codemods | [`.agents/skills/upgrade-packages/SKILL.md`](.agents/skills/upgrade-packages/SKILL.md) |

## Cursor

To auto-load a skill in Cursor, symlink or copy it into `.cursor/skills/`:

```bash
mkdir -p .cursor/skills
ln -sf ../../.agents/skills/fix-dependency-security .cursor/skills/fix-dependency-security
ln -sf ../../.agents/skills/audit-allow-builds .cursor/skills/audit-allow-builds
ln -sf ../../.agents/skills/audit-ide-dependencies .cursor/skills/audit-ide-dependencies
ln -sf ../../.agents/skills/project-ide-profile .cursor/skills/project-ide-profile
ln -sf ../../.agents/skills/upgrade-packages .cursor/skills/upgrade-packages
```

## Conventions

- Run commands in the repo root unless noted otherwise.
- Prefer `pnpm` when `pnpm-lock.yaml` exists.
- After dependency changes: `pnpm install`, re-run audit, then `pnpm type-check` / `pnpm lint` (Biome) if applicable.

## E2E / Playwright

- **Browser:** system **Brave Beta** (`/usr/bin/brave-browser-beta`), not Playwright-downloaded Chromium. Config: `playwright.config.ts`, `playwright.brave.ts`.
- **Do not** run `pnpm exec playwright install chromium` for local E2E; use `pnpm exec playwright uninstall` if bundled Chromium was installed earlier.
- Override path: `BRAVE_BETA_PATH`. Details: [tests/e2e/README.md](tests/e2e/README.md).
- After `@playwright/test` major bumps: update the package only; reinstall Brave on the machine if needed — **not** `playwright install chromium`.
