---
name: supply-chain-harden
description: Harden pnpm workspace and fix vulnerabilities. Use when user asks for pnpm audit, deprecations, supply-chain security, workspace hardening, or sfw/firewall checks.
---

# Supply-chain harden

## When to use

- `pnpm audit`, vulnerability fixes, deprecated packages
- Hardening `pnpm-workspace.yaml` (trustPolicy, minimumReleaseAge, strictDepBuilds)
- Moving overrides from `package.json` to workspace config

## Steps

1. Read current `pnpm-workspace.yaml`, `package.json`, and lockfile context.
2. WebSearch or docs for pnpm setting names — do not guess security flags.
3. Apply minimal config changes; prefer non-breaking version bumps.
4. Run `pnpm install` — must succeed before done.
5. Run `pnpm audit` (or project script); report remaining issues honestly.
6. Summarize what changed, operational trade-offs, and what still needs manual action.

## Output

- List of config keys changed and why
- Install/audit command results
- Explicit confidence on breaking vs safe changes

Do not claim "max security" without running install. Auth/registry settings stay in `.npmrc`.
