---
name: fix-dependency-security
description: >-
  Fixes dependency vulnerabilities and deprecations, hardens the supply chain,
  and wraps package-manager installs with Socket Firewall (sfw). Use when the
  user asks for pnpm/npm audit, security fixes, deprecated packages,
  supply-chain attack prevention, StepSecurity-style dependency hygiene, or sfw.
---

# Fix dependency security

End-to-end workflow for **vulnerabilities**, **deprecations**, and **supply-chain install safety** in Node/pnpm projects.

## Principles

1. **Prefer real upgrades** over silencing warnings (`allowedDeprecatedVersions`, ignoring audit).
2. **One source of policy** for pnpm: `pnpm-workspace.yaml` (overrides, `minimumReleaseAge`, `blockExoticSubdeps`) — not scattered `package.json` `pnpm` blocks.
3. **Wrap risky commands** with **SFW** so malicious packages are blocked before download.
4. **Re-verify** after every change: install → audit → type-check/lint.

## Tooling map

| Tool | Role |
|------|------|
| **pnpm audit** | CVE/advisory report for the lockfile |
| **pnpm overrides** (`pnpm-workspace.yaml`) | Force patched transitive versions |
| **SFW (`sfw`)** | [Socket Firewall Free](https://docs.socket.dev/docs/socket-firewall-free) — prefix installs; blocks confirmed malware at network layer |
| **StepSecurity** | CI/runtime supply-chain platform ([Harden-Runner](https://docs.stepsecurity.io/harden-runner/workflow-runs), threat intel, cooldown policies). Complements local `sfw`; does not replace `pnpm audit` |
| **pnpm settings** | `minimumReleaseAge`, `blockExoticSubdeps`, `trustPolicy` — delay/block risky resolution ([pnpm supply-chain security](https://pnpm.io/supply-chain-security)) |

SFW is the **`sfw` CLI** (Socket). StepSecurity is often first to publish npm incident analysis; use their advisories for context, and **Harden-Runner** in GitHub Actions for CI egress control.

---

## Workflow checklist

Copy and track:

```
- [ ] 1. Baseline: pnpm audit (and pnpm outdated if useful)
- [ ] 2. Plan fixes (direct bumps vs overrides vs upstream)
- [ ] 3. Apply fixes (package.json + pnpm-workspace.yaml)
- [ ] 4. Install behind SFW: sfw pnpm install
- [ ] 5. Confirm: pnpm audit → clean
- [ ] 6. Confirm: no deprecated deps (install output / pnpm why)
- [ ] 7. Validate: pnpm type-check && pnpm lint
```

---

## Step 1: Audit

```bash
pnpm audit
```

- Note **severity**, **package**, **patched versions**, and **paths** (which dependency pulls it in).
- If multiple advisories affect one package, bump to the **highest** required patched version (e.g. `>=16.2.6` beats `>=16.2.5`).

```bash
pnpm why <package>    # trace transitive source
pnpm outdated         # optional: direct upgrade candidates
```

---

## Step 2: Fix vulnerabilities

### Direct dependencies

Bump in `package.json`, then install (see Step 4).

Example: Next.js advisories → set `next` to latest patched in the same major line (e.g. `16.2.6`).

### Transitive only

Add or update **overrides** in `pnpm-workspace.yaml`:

```yaml
overrides:
  "<package>": ^<patched-version>
```

Align related packages (e.g. `@next/env` with `next`).

### After overrides

```bash
sfw pnpm install
pnpm audit
```

Do not stop until `pnpm audit` reports no known vulnerabilities (or document accepted risk with user approval).

---

## Step 3: Fix deprecations

```bash
pnpm install    # surface deprecated warnings (prefer sfw — Step 4)
pnpm why <deprecated-package>
```

| Situation | Action |
|-----------|--------|
| Newer non-deprecated version exists | Override or bump parent dependency |
| Entire package deprecated (all versions) | Bump **parent** chain (e.g. `onnxruntime-node@1.26` → `global-agent@4` removes deprecated `boolean`) |
| Only silencing available | **Avoid** `allowedDeprecatedVersions` unless user explicitly accepts risk |

---

## Step 4: SFW (Socket Firewall) for installs

### Install SFW once per machine

```bash
npm i -g sfw
# or: binary from https://github.com/SocketDev/sfw-free/releases
```

### Prefix package-manager commands

```bash
sfw pnpm install
sfw pnpm add <pkg>
sfw pnpm update <pkg>
sfw npm ci          # if using npm in CI
```

**Limits:** SFW blocks **network fetches** of confirmed malware. Cached artifacts are not re-checked — after compromise scares, prune cache:

```bash
pnpm store prune
```

**CI (GitHub Actions):**

```yaml
- uses: socketdev/action@v1
  with:
    mode: firewall-free   # or firewall for enterprise
- run: sfw pnpm install --frozen-lockfile
```

Docs: https://docs.socket.dev/docs/socket-firewall-free

---

## Step 5: pnpm supply-chain hardening

Prefer settings in **`pnpm-workspace.yaml`** (not `package.json`):

```yaml
# Example — tune per project; pnpm 11 defaults minimumReleaseAge to 1440 (1 day)
minimumReleaseAge: 1440
blockExoticSubdeps: true
# trustPolicy: no-downgrade   # optional, stricter trust
```

Keep existing project overrides (security pins) alongside these keys.

**`allowBuilds`:** only enable lifecycle scripts for packages that truly need native builds (e.g. `sharp`, `esbuild`).

---

## Step 6: CI / StepSecurity (optional)

For GitHub Actions, add [Harden-Runner](https://github.com/step-security/harden-runner) early in the job to detect anomalous egress and tampering:

```yaml
- uses: step-security/harden-runner@v2
  with:
    egress-policy: audit    # then tighten to block + allowed-endpoints
```

Use StepSecurity threat write-ups when investigating **npm incidents** (typosquats, maintainer hijacks). Pair with `sfw` on developer machines and `pnpm audit` in CI.

---

## Step 7: Validate

```bash
pnpm audit
pnpm type-check
pnpm lint
pnpm build    # if user expects full verification
```

Summarize for the user:

- What was vulnerable / deprecated and **how** it was fixed
- Version bumps and overrides added
- Whether `sfw` was used for install
- Remaining risks (e.g. AI-flagged but unconfirmed packages SFW only warns on)

---

## Project-specific notes (devprofile)

- **Package manager:** pnpm 11; config in `pnpm-workspace.yaml`.
- **Hardened workspace:** `minimumReleaseAge: 1440` (strict 1d; bump to `10080` when lockfile has no packages newer than 7d), `minimumReleaseAgeStrict`, `blockExoticSubdeps`, `trustPolicy: no-downgrade`, `strictDepBuilds`, `verifyDepsBeforeRun: error`, `sideEffectsCache: false`, explicit `allowBuilds` whitelist.
- **Overrides** pin transitive security packages and ONNX stack versions.
- **Do not** reintroduce `allowedDeprecatedVersions` for `boolean` — fixed via `onnxruntime-node` / `global-agent` bumps.

---

## Anti-patterns

- Pinning vulnerable versions indefinitely without user sign-off
- `allowedDeprecatedVersions: "*"` instead of upgrading
- Running `pnpm add` / `pnpm update` without `sfw` when hardening supply chain
- Putting pnpm `overrides` in `package.json` when the repo uses `pnpm-workspace.yaml`
- Assuming audit clean means safe without checking deprecations and install-time firewall

## References

- [pnpm audit](https://pnpm.io/cli/audit)
- [pnpm overrides](https://pnpm.io/package_json#pnpmoverrides)
- [pnpm supply-chain security](https://pnpm.io/supply-chain-security)
- [Socket Firewall Free (`sfw`)](https://docs.socket.dev/docs/socket-firewall-free)
- [StepSecurity docs](https://docs.stepsecurity.io/)
