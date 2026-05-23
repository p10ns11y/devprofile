# Devcontainer templates (devprofile)

Copy into `.devcontainer/` at repo root when applying [../SKILL.md](../SKILL.md):

| Template | Target |
|----------|--------|
| `devprofile.devcontainer.json` | `.devcontainer/devcontainer.json` |
| `devprofile.Dockerfile` | `.devcontainer/Dockerfile` |

Before commit:

1. Pin `FROM node:24-bookworm-slim@sha256:…` (see comment in Dockerfile — not Microsoft devcontainers images).
2. Match `corepack prepare pnpm@…` to `package.json` → `packageManager`.
3. Run `pnpm install --frozen-lockfile` inside the built container.

E2E with Brave Beta is a **host** workflow — not installed in the default container image.
