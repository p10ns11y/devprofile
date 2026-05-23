# Devcontainer templates (devprofile)

Copy into `.devcontainer/` at repo root when applying [../SKILL.md](../SKILL.md):

| Template | Target |
|----------|--------|
| `devprofile.devcontainer.json` | `.devcontainer/devcontainer.json` |
| `devprofile.Dockerfile` | `.devcontainer/Dockerfile` |

Before commit:

1. Resolve `<NODE_MAJOR>` per [SKILL.md Step 1](../SKILL.md#step-1-resolve-node-major) (run `../scripts/resolve-node-lts-major.mjs` if the repo has no `engines.node` / `.nvmrc`).
2. Set `ARG NODE_VERSION=<NODE_MAJOR>` and pin `FROM node:<NODE_MAJOR>-bookworm-slim@sha256:…` (see Dockerfile comment — not Microsoft devcontainers images).
3. Match `corepack prepare pnpm@…` to `package.json` → `packageManager`.
4. Run `pnpm install --frozen-lockfile` inside the built container.

E2E with Brave Beta is a **host** workflow — not installed in the default container image.
