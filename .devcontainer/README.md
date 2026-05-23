# Dev Container (devprofile)

Hardened setup per [`.agents/skills/devcontainer-hardened/SKILL.md`](../.agents/skills/devcontainer-hardened/SKILL.md).

## Cursor (Anysphere Dev Containers)

Cursor uses **Anysphere’s** extension — **not** Microsoft’s `ms-vscode-remote.remote-containers` (blocked/aliased in Cursor).

| Item | Value |
|------|--------|
| Host extension | **Dev Containers** — `anysphere.remote-containers` |
| Do not install | `ms-vscode-remote.remote-containers` (use Anysphere only) |

### Open in container

1. Install / enable **Dev Containers** (`anysphere.remote-containers`) — keep it **≥ 1.0.21** for reliable `portsAttributes`.
2. Disable or uninstall the Microsoft Dev Containers extension if Cursor offered it.
3. Command Palette → **Dev Containers: Reopen in Container** (first time: **Rebuild and Reopen in Container**).
4. Wait for `postCreateCommand` (`pnpm install --frozen-lockfile`).
5. Terminal: `pnpm dev` → port **3000** (forwarded by the extension).

### Port forwarding (Cursor-specific)

`devcontainer.json` sets:

- `forwardPorts`: `[3000]` only
- `otherPortsAttributes.onAutoForward`: `"ignore"` — avoids forwarding hundreds of random ports (known Anysphere memory issue)
- Container settings: `remote.restoreForwardedPorts: false`, `remote.autoForwardPortsSource: "output"`

If port 3000 does not open after `pnpm dev`, use the **Ports** panel or run **Forward Port** for 3000, then **Rebuild Container** after upgrading the extension.

## Image

- **Base:** `node:24-bookworm-slim` (Node 24 LTS, Docker Official Image), digest-pinned in `Dockerfile`
- **User:** `node` (non-root)
- **Capabilities:** `--cap-drop=ALL`, `no-new-privileges`

## After rebuild

```bash
pnpm dev          # http://localhost:3000
pnpm type-check
pnpm lint
```

`pnpm@11.2.2` is activated in the image (corepack, as root at build). `postCreateCommand` runs `pnpm install --frozen-lockfile` (respects `pnpm-workspace.yaml`).

## Not in this container (by design)

- **E2E with Brave Beta** — run on the host; see [tests/e2e/README.md](../tests/e2e/README.md)
- **`pnpm generate-pdf`** — needs Bun; run on host or CI
- **Socket Firewall (`sfw`)** — use on host/CI when changing dependencies

## Refresh image digest

```bash
docker pull node:24-bookworm-slim
docker inspect --format='{{index .RepoDigests 0}}' node:24-bookworm-slim
# Update the sha256 in Dockerfile, then Dev Containers: Rebuild Container
```

## Troubleshooting

| Problem | Try |
|---------|-----|
| “Error resolving dev container authority” | Docker running; rebuild; extension ≥ 1.0.21 |
| High RAM / thousands of forwarded ports | Upgrade extension; confirm `otherPortsAttributes`; kill stray `docker exec` processes |
| `cap-drop=ALL` fails to start | Remove `runArgs` in `devcontainer.json` temporarily |
| `postCreate` pnpm fails | Set `CI=true` (already in `remoteEnv`) |
