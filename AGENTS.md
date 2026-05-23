# Agent instructions

This repository includes **portable agent skills** under [`.agents/skills/`](.agents/skills/).

## Skills index

| When the user asks about… | Read |
|---------------------------|------|
| `pnpm audit`, npm vulnerabilities, deprecated packages, supply-chain attacks, `sfw`, install safety | [`.agents/skills/fix-dependency-security/SKILL.md`](.agents/skills/fix-dependency-security/SKILL.md) |
| `allowBuilds`, postinstall/build scripts, `strictDepBuilds`, `approve-builds`, lifecycle-script risk | [`.agents/skills/audit-allow-builds/SKILL.md`](.agents/skills/audit-allow-builds/SKILL.md) |
| Cursor/VS Code extensions, IDE plugins, editor supply-chain, MCP tooling deps | [`.agents/skills/audit-ide-dependencies/SKILL.md`](.agents/skills/audit-ide-dependencies/SKILL.md) |
| Per-project editor settings (`.editor/profile.json`), extensions, Cursor hooks | [`.agents/skills/project-editor-profile/SKILL.md`](.agents/skills/project-editor-profile/SKILL.md) |
| Upgrade, update, or bump dependencies; Next/React/TS/Tailwind majors; codemods | [`.agents/skills/upgrade-packages/SKILL.md`](.agents/skills/upgrade-packages/SKILL.md) |
| React components, hooks, client state, effects, Context, XState; **no RSC** for UI logic | [`.agents/skills/react-client-expert/SKILL.md`](.agents/skills/react-client-expert/SKILL.md) |
| Dev Containers, Codespaces, hardened `.devcontainer` (minimal blast radius) | [`.agents/skills/devcontainer-hardened/SKILL.md`](.agents/skills/devcontainer-hardened/SKILL.md) |
| Hermes, OpenClaw, Grok Build concurrently; git worktrees; Modal/Daytona/E2B sandboxes | [`.agents/skills/concurrent-cli-agents/SKILL.md`](.agents/skills/concurrent-cli-agents/SKILL.md) |
| Git worktrees, commit-then-merge, agent branch integration (not `cp` from worktrees) | [`.agents/skills/git-worktrees/SKILL.md`](.agents/skills/git-worktrees/SKILL.md) |
| Orchestrating agents: briefs, verify-before-merge, iterative waves, resume work | [`.agents/skills/agent-orchestrator/SKILL.md`](.agents/skills/agent-orchestrator/SKILL.md) |

## Cursor

**Rules:** [.cursor/rules/](.cursor/rules/) (portable copy via [.agent/rules](.agent/rules) → same directory).

To auto-load a skill in Cursor, symlink or copy it into `.cursor/skills/`:

```bash
mkdir -p .cursor/skills
ln -sf ../../.agents/skills/fix-dependency-security .cursor/skills/fix-dependency-security
ln -sf ../../.agents/skills/audit-allow-builds .cursor/skills/audit-allow-builds
ln -sf ../../.agents/skills/audit-ide-dependencies .cursor/skills/audit-ide-dependencies
ln -sf ../../.agents/skills/project-editor-profile .cursor/skills/project-editor-profile
ln -sf ../../.agents/skills/upgrade-packages .cursor/skills/upgrade-packages
ln -sf ../../.agents/skills/react-client-expert .cursor/skills/react-client-expert
ln -sf ../../.agents/skills/devcontainer-hardened .cursor/skills/devcontainer-hardened
ln -sf ../../.agents/skills/concurrent-cli-agents .cursor/skills/concurrent-cli-agents
ln -sf ../../.agents/skills/git-worktrees .cursor/skills/git-worktrees
ln -sf ../../.agents/skills/agent-orchestrator .cursor/skills/agent-orchestrator
```

## Agent workflow (triage first)

Before large or multi-step work, read [agent-orchestrator](.agents/skills/agent-orchestrator/SKILL.md) and **triage**:

- **Single-shot** — one obvious fix, ≤1–2 files, low risk: implement directly, run `pnpm type-check` / `pnpm lint`, no task brief or worktrees.
- **Light** — small scope, same concern: short outcome + verification bullets in chat, then implement.
- **Full orchestration** — multiple agents, spikes, merges, or verifying another agent’s “done”: briefs, worktrees, independent verification ([git-worktrees](.agents/skills/git-worktrees/SKILL.md)).

Use common sense; do not over-process trivial requests.

## Conventions

- Run commands in the repo root unless noted otherwise.
- Prefer `pnpm` when `pnpm-lock.yaml` exists.
- After dependency changes: `pnpm install`, re-run audit, then `pnpm type-check` / `pnpm lint` (Biome) if applicable.
- **Lint:** `pnpm lint` shows **errors only** (format + unused imports/vars + `type="button"`). `pnpm lint:report` lists optional/warn-level rules. Noisy rules (`noExplicitAny`, a11y overlays, `useEffect` deps) are off — see `biome.json`.
- **React client UI:** follow [react-client-expert](.agents/skills/react-client-expert/SKILL.md). Biome does not lint `useEffect` dependency arrays (`useExhaustiveDependencies` off).
- **React refactor backlog:** [`docs/react-client-roadmap.md`](docs/react-client-roadmap.md).

## E2E / Playwright

- **Browser:** system **Brave Beta** (`/usr/bin/brave-browser-beta`), not Playwright-downloaded Chromium. Config: `playwright.config.ts`, `playwright.brave.ts`.
- **Do not** run `pnpm exec playwright install chromium` for local E2E; use `pnpm exec playwright uninstall` if bundled Chromium was installed earlier.
- Override path: `BRAVE_BETA_PATH`. Details: [tests/e2e/README.md](tests/e2e/README.md).
- After `@playwright/test` major bumps: update the package only; reinstall Brave on the machine if needed — **not** `playwright install chromium` for tests.
- **Headed / UI:** `pnpm test:e2e:headed`, test runs, and `pnpm test:e2e:ui` all use **Brave Beta** (`launchOptions.executablePath`; UI panel opened via `brave-browser-beta` in `scripts/playwright-ui-brave.mjs`).
