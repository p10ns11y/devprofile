# Agent instructions

This repository includes **portable agent skills** under [`.agents/skills/`](.agents/skills/).

## Agent Skills — Connected System

This project uses a **two-skill connected system**:

- **`ai-optimization`** — World-class **fission engine** (token-efficient pruning + compression). Use for speed.
- **`fusion-sage`** — **Fusion reactor** built on top (synthesis, surplus generation, self-improvement). Use for architecture, long-term value, and compounding returns.

**Recommended Setup**:
1. Load `.agents/rules/fusion-sage.mdc` in `.cursor/rules/` (`alwaysApply: true` — routes both skills)
2. Optional: `.agents/rules/ai-optimization.mdc` (`alwaysApply: false` — fission-only via `/fission`)
3. Both skills live in `.agents/skills/`; symlink into `.cursor/skills/`
4. The fusion rule intelligently routes between fission and fusion and applies the hybrid response format.

**Quick Commands**:
- Normal work → Let it auto-decide
- Architecture / future-proofing → Say "use fusion" or "ignite"
- Pure speed → Say "just fission"

**Philosophy**: Fission keeps you fast. Fusion makes you unstoppable.

See [fusion-sage/SKILL.md](.agents/skills/fusion-sage/SKILL.md) and [ai-optimization/SKILL.md](.agents/skills/ai-optimization/SKILL.md) for details.

## Skills index

| When the user asks about… | Read |
|---------------------------|------|
| Token efficiency, context compression, large codebases, "too many tokens" | [`.agents/skills/ai-optimization/SKILL.md`](.agents/skills/ai-optimization/SKILL.md) (+ [devprofile-typescript](.agents/skills/ai-optimization/references/devprofile-typescript.md)) |
| Architecture synthesis, surplus generation, self-improvement, "use fusion" | [`.agents/skills/fusion-sage/SKILL.md`](.agents/skills/fusion-sage/SKILL.md) (+ [devprofile-fusion-playbook](.agents/skills/fusion-sage/references/devprofile-fusion-playbook.md)) |
| `pnpm audit`, npm vulnerabilities, deprecated packages, supply-chain attacks, `sfw`, install safety | [`.agents/skills/fix-dependency-security/SKILL.md`](.agents/skills/fix-dependency-security/SKILL.md) |
| `allowBuilds`, postinstall/build scripts, `strictDepBuilds`, `approve-builds`, lifecycle-script risk | [`.agents/skills/audit-allow-builds/SKILL.md`](.agents/skills/audit-allow-builds/SKILL.md) |
| Cursor/VS Code extensions, IDE plugins, editor supply-chain, MCP tooling deps | [`.agents/skills/audit-ide-dependencies/SKILL.md`](.agents/skills/audit-ide-dependencies/SKILL.md) |
| Per-project editor settings (`.editor/profile.json`), extensions, Cursor hooks | [`.agents/skills/project-editor-profile/SKILL.md`](.agents/skills/project-editor-profile/SKILL.md) |
| Upgrade, update, or bump dependencies; Next/React/TS/Tailwind majors; codemods | [`.agents/skills/upgrade-packages/SKILL.md`](.agents/skills/upgrade-packages/SKILL.md) |
| React components, hooks, client state, effects, Context, XState; **no RSC** for UI logic | [`.agents/skills/react-client-expert/SKILL.md`](.agents/skills/react-client-expert/SKILL.md) |
| Dev Containers, Codespaces, hardened `.devcontainer` (minimal blast radius) | [`.agents/skills/devcontainer-hardened/SKILL.md`](.agents/skills/devcontainer-hardened/SKILL.md) |
| Hermes, OpenClaw, Grok Build concurrently; git worktrees; Modal/Daytona/E2B sandboxes | [`.agents/skills/concurrent-cli-agents/SKILL.md`](.agents/skills/concurrent-cli-agents/SKILL.md) |
| Disk bloat from agent worktrees / execute-plan orphans (`~/.grok/worktrees/`) | [`.agents/skills/git-worktrees/SKILL.md`](.agents/skills/git-worktrees/SKILL.md) (see "Disk hygiene" section + `agent-worktree-clean.sh`) |
| Git worktrees, commit-then-merge, agent branch integration (not `cp` from worktrees) | [`.agents/skills/git-worktrees/SKILL.md`](.agents/skills/git-worktrees/SKILL.md) |
| Orchestrating agents: briefs, verify-before-merge, iterative waves, resume work | [`.agents/skills/agent-orchestrator/SKILL.md`](.agents/skills/agent-orchestrator/SKILL.md) |
| Split a branch or mixed changes into small reviewable PRs | [`.agents/skills/split-to-prs/SKILL.md`](.agents/skills/split-to-prs/SKILL.md) |
| Long-running execute-plan, worktrees + Graphite stacks, agent vs user terminal friction | [`docs/agent-workflow-lessons.md`](docs/agent-workflow-lessons.md) (plus guidance in `git-worktrees` and `agent-orchestrator` skills) |

## Cursor

**Rules:** canonical [`.agents/rules/`](.agents/rules/); Cursor loads via [`.cursor/rules`](.cursor/rules) → `.agents/rules`. For the connected system, enable **`fusion-sage.mdc`** (routes to `ai-optimization` + `fusion-sage`).

To auto-load a skill in Cursor, symlink or copy it into `.cursor/skills/`:

```bash
mkdir -p .cursor/skills
ln -sf ../../.agents/skills/ai-optimization .cursor/skills/ai-optimization
ln -sf ../../.agents/skills/fusion-sage .cursor/skills/fusion-sage
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
ln -sf ../../.agents/skills/split-to-prs .cursor/skills/split-to-prs
```

## Agent workflow (triage first)

Before large or multi-step work, read [agent-orchestrator](.agents/skills/agent-orchestrator/SKILL.md) and **triage**:

- **Single-shot** — one obvious fix, ≤1–2 files, low risk: implement directly, run `pnpm type-check` / `pnpm lint`, no task brief or worktrees.
- **Light** — small scope, same concern: short outcome + verification bullets in chat, then implement.
- **Full orchestration** — multiple agents, spikes, merges, or verifying another agent’s “done”: briefs, worktrees, independent verification ([git-worktrees](.agents/skills/git-worktrees/SKILL.md)).

Use common sense; do not over-process trivial requests.

## Long-running plans, execute-plan, worktrees, and Graphite stacks

When running multi-session efforts (especially via `execute-plan` + subagents in worktrees that later need to become a real Graphite stack), several recurring frictions appear:

- Agent work happens in `~/.grok/worktrees/...`; the user's primary terminal (where `gt` is authenticated and `gt submit --stack` is run) is usually elsewhere. This causes auth, state, and branch visibility mismatches.
- Reusing "natural" feature branch names (e.g. `feature/xai-agentic-profile-qa-reactor`) for the final integration/stack branch frequently collides with pre-existing user branches that have different history.
- `gt submit --stack` and full Graphite operations are often not possible from inside the agent session. Plan for an explicit handoff to the user in their authenticated environment.
- A single linear branch containing all PRs is easy to produce via cherry-pick, but turning it into a clean multi-level Graphite stack usually requires either `gt split --by-commit` or deliberate reconstruction from the individual `execute-plan/...-pr-N-*` branches.

See [`docs/agent-workflow-lessons.md`](docs/agent-workflow-lessons.md) for detailed patterns, anti-patterns, and recommendations (especially around naming, environment separation, and final stack assembly).

## Conventions

- Run commands in the repo root unless noted otherwise.
- Prefer `pnpm` when `pnpm-lock.yaml` exists.
- After dependency changes: `pnpm install`, re-run audit, then `pnpm type-check` / `pnpm lint` (Biome) if applicable.
- **Lint:** `pnpm lint` shows **errors only** (format + unused imports/vars + `type="button"`). `pnpm lint:report` lists optional/warn-level rules. Noisy rules (`noExplicitAny`, a11y overlays, `useEffect` deps) are off — see `biome.json`.
- **React client UI:** follow [react-client-expert](.agents/skills/react-client-expert/SKILL.md). Biome does not lint `useEffect` dependency arrays (`useExhaustiveDependencies` off).
- **React refactor backlog:** [`docs/react-client-roadmap.md`](docs/react-client-roadmap.md).
- After large `execute-plan`, `best-of-n`, or concurrent agent runs: first run `grok worktree gc`, then `.agents/skills/git-worktrees/scripts/agent-worktree-clean.sh --prune` when you need branch preservation (see git-worktrees "Grok CLI worktree management" section).

## E2E / Playwright

- **Browser:** system **Brave Beta** (`/usr/bin/brave-browser-beta`), not Playwright-downloaded Chromium. Config: `playwright.config.ts`, `playwright.brave.ts`.
- **Do not** run `pnpm exec playwright install chromium` for local E2E; use `pnpm exec playwright uninstall` if bundled Chromium was installed earlier.
- Override path: `BRAVE_BETA_PATH`. Details: [tests/e2e/README.md](tests/e2e/README.md).
- After `@playwright/test` major bumps: update the package only; reinstall Brave on the machine if needed — **not** `playwright install chromium` for tests.
- **Headed / UI:** `pnpm test:e2e:headed`, test runs, and `pnpm test:e2e:ui` all use **Brave Beta** (`launchOptions.executablePath`; UI panel opened via `brave-browser-beta` in `scripts/playwright-ui-brave.mjs`).
