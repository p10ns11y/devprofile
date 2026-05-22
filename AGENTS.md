# Agent instructions

This repository includes **portable agent skills** under [`.agents/skills/`](.agents/skills/).

## Skills index

| When the user asks about… | Read |
|---------------------------|------|
| `pnpm audit`, npm vulnerabilities, deprecated packages, supply-chain attacks, `sfw`, install safety | [`.agents/skills/fix-dependency-security/SKILL.md`](.agents/skills/fix-dependency-security/SKILL.md) |
| `allowBuilds`, postinstall/build scripts, `strictDepBuilds`, `approve-builds`, lifecycle-script risk | [`.agents/skills/audit-allow-builds/SKILL.md`](.agents/skills/audit-allow-builds/SKILL.md) |
| Upgrade, update, or bump dependencies; Next/React/TS/Tailwind majors; codemods | [`.agents/skills/upgrade-packages/SKILL.md`](.agents/skills/upgrade-packages/SKILL.md) |

## Cursor

To auto-load a skill in Cursor, symlink or copy it into `.cursor/skills/`:

```bash
mkdir -p .cursor/skills
ln -sf ../../.agents/skills/fix-dependency-security .cursor/skills/fix-dependency-security
ln -sf ../../.agents/skills/audit-allow-builds .cursor/skills/audit-allow-builds
ln -sf ../../.agents/skills/upgrade-packages .cursor/skills/upgrade-packages
```

## Conventions

- Run commands in the repo root unless noted otherwise.
- Prefer `pnpm` when `pnpm-lock.yaml` exists.
- After dependency changes: `pnpm install`, re-run audit, then `pnpm type-check` / `pnpm lint` if applicable.
