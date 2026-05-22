# Agent skills (tool-agnostic)

Portable instructions for coding agents (Cursor, Grok, Hermes, Claude Code, Codex, etc.).

## Layout

```
.agents/skills/<skill-name>/SKILL.md
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
| Project IDE profile (.ide → .vscode / Cursor hooks) | [skills/project-ide-profile/SKILL.md](skills/project-ide-profile/SKILL.md) |
| Package upgrades (semver-safe, framework majors + codemods) | [skills/upgrade-packages/SKILL.md](skills/upgrade-packages/SKILL.md) |

When adding a skill, update this table and the root [AGENTS.md](../AGENTS.md) index.
