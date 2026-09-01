# Agent skills (tool-agnostic)

Portable instructions for coding agents (Cursor, Grok, Hermes, Claude Code, Codex, etc.).

## Layout

```
.agents/skills/<skill-name>/SKILL.md
.agents/rules/          ← canonical; .cursor/rules → .agents/rules (Cursor)
```

Each skill is a directory with a `SKILL.md` file (YAML frontmatter + markdown body).

## How agents discover skills

| Tool | Typical discovery |
|------|-------------------|
| **Cursor** | Copy or symlink into `.cursor/skills/<skill-name>/`, or reference this path in project rules / `AGENTS.md` |
| **Claude Code** | `.claude/skills/` or explicit `@` / skill path in settings |
| **Hermes / other agents** | Read `AGENTS.md` at repo root; load `SKILL.md` when the task matches the skill `description` |

## Available skills

| Skill | Path |
|-------|------|
| Dependency security (audit, deprecations, SFW, supply chain) | [skills/fix-dependency-security/SKILL.md](skills/fix-dependency-security/SKILL.md) |
| allowBuilds / lifecycle-script supply-chain audit | [skills/audit-allow-builds/SKILL.md](skills/audit-allow-builds/SKILL.md) |
| IDE extensions / Cursor plugins (pnpm/npm audit) | [skills/audit-ide-dependencies/SKILL.md](skills/audit-ide-dependencies/SKILL.md) |
| Project editor profile (.editor → .vscode / Cursor hooks) | [skills/project-editor-profile/SKILL.md](skills/project-editor-profile/SKILL.md) |
| Package upgrades (semver-safe, framework majors + codemods) | [skills/upgrade-packages/SKILL.md](skills/upgrade-packages/SKILL.md) |
| React client architecture (state, effects, refs, XState; no RSC) | [skills/react-client-expert/SKILL.md](skills/react-client-expert/SKILL.md) |
| Hardened Dev Container / Codespaces config (minimal, digest-pinned) | [skills/devcontainer-hardened/SKILL.md](skills/devcontainer-hardened/SKILL.md) |
| Concurrent CLI agents (Hermes, OpenClaw, Grok Build; worktrees + cloud sandboxes) | [skills/concurrent-cli-agents/SKILL.md](skills/concurrent-cli-agents/SKILL.md) |
| Git worktrees (safe merge, branches vs worktrees, no cp integration) | [skills/git-worktrees/SKILL.md](skills/git-worktrees/SKILL.md) |
| Agent orchestrator (briefs, verify done, iterative human-like workflow) | [skills/agent-orchestrator/SKILL.md](skills/agent-orchestrator/SKILL.md) |
| Split to PRs (plan before git writes; recoverable snapshot) | [skills/split-to-prs/SKILL.md](skills/split-to-prs/SKILL.md) |

When adding a skill, update this table and the root [AGENTS.md](../AGENTS.md) index.

## Agent rules (`.agents/rules/`)

Cursor: symlink `.cursor/rules` → `../.agents/rules` (see root [AGENTS.md](../AGENTS.md)).

| Rule | When it applies |
|------|-----------------|
| [agent-workflow.mdc](rules/agent-workflow.mdc) | Always — triage, verify, no worktree `cp` |
| [react-client.mdc](rules/react-client.mdc) | `src/**/*.ts(x)` |
| [dependencies-and-lockfile.mdc](rules/dependencies-and-lockfile.mdc) | `package.json`, lockfile, workspace |
| [e2e-playwright-brave.mdc](rules/e2e-playwright-brave.mdc) | E2E / Playwright config |
| [e2e-visual-snapshots.mdc](rules/e2e-visual-snapshots.mdc) | Layout/copy change — refresh Linux PNG baselines |
| [devcontainer.mdc](rules/devcontainer.mdc) | `.devcontainer/**` |
| [split-to-prs.mdc](rules/split-to-prs.mdc) | User asks to split branch/PR/changes |

## E2E (Playwright + Brave Beta)

- Local and agent runs use **Brave Beta** as the Chromium driver (`executablePath`), not Playwright’s bundled Chromium.
- See root [AGENTS.md](../AGENTS.md) (E2E / Playwright) and [tests/README.md](../tests/README.md). Visual PNG refresh: [rules/e2e-visual-snapshots.mdc](rules/e2e-visual-snapshots.mdc).
- Uninstall unused Playwright browsers: `pnpm exec playwright uninstall` (drops bundled Chromium for this install).
