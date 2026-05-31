# Production incident: `ERR_REQUIRE_ESM` on Vercel (Next.js 16.2 + `"type": "module"`)

This document records a May–June 2026 production outage pattern: dynamic routes and API handlers failing on Vercel with `ERR_REQUIRE_ESM`, while `pnpm dev` and `pnpm build` succeed locally.

**Status:** Fix applied locally (root `"type": "module"` removed). **Redeploy to Vercel** and hit dynamic routes to confirm in production.

---

## Symptoms

Vercel runtime logs (Lambda `/var/task/`):

```
Failed to handle /x?_rsc=5CB68i4pnAekjehf
Error: require() of ES Module /var/task/.next/server/app/x/page.js from /var/task/___next_launcher.cjs not supported.
page.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" ...
  code: 'ERR_REQUIRE_ESM'
```

Observed behavior:

- **Local:** `pnpm dev`, `pnpm build`, and (with a full `.next/` tree) `pnpm start` all work.
- **Production:** Dynamic routes (`ƒ`) and API routes fail at runtime; many static pages (`○`) can appear fine because they are served from the CDN without hitting the broken Lambda path.
- **`?_rsc=…` in the URL is not the cause** — it is normal App Router behavior (client requesting an RSC flight payload). The failure is in Vercel’s serverless launcher loading the server chunk.

---

## Root cause

Three factors combine. None of them is “RSC is broken.”

| Factor | In this repo | Effect |
|--------|--------------|--------|
| Root ESM scope | `"type": "module"` in `package.json` (since Sep 2025) | Node treats `.js` files under the app as ESM unless a closer `package.json` overrides |
| Next 16.2 deploy output | `next@16.2.x` (since Mar/May 2026) | Vercel uses `___next_launcher.cjs`, which loads server chunks via **`require()`** (CommonJS) |
| Missing bundle boundary | `.next/package.json` not reliably included in the Vercel Lambda artifact on 16.2.x | Node walks up to the **root** `package.json`, sees `"type": "module"`, misclassifies CJS chunks as ESM |

Next.js **does** emit the correct fix at build time:

```js
// next/dist/build/index.js (comment + write)
// Ensure commonjs handling is used for files in the distDir (generally .next)
await writeFileUtf8(path.join(distDir, 'package.json'), '{"type": "commonjs"}');
```

Built server output **is** CommonJS (`require`, `module.exports`). Locally, `.next/package.json` sits on disk next to those files, so Node resolves them correctly.

On Vercel, when `.next/package.json` is absent from the function bundle, `require(page.js)` from `___next_launcher.cjs` throws `ERR_REQUIRE_ESM`.

This is a **platform packaging / module-resolution bug** (Vercel launcher + Next 16.2 adapter + root `"type": "module"`), not an application logic bug.

### Local reproduction

Delete `.next/package.json` after a build, then `require()` a server page chunk from a synthetic CJS context while root `package.json` still has `"type": "module"`. You get the same error class as production.

---

## Why a recent merge looked innocent (PR #51, May 31 2026)

Git history shows **no dependency or Next version change** in that merge:

- `"next": "16.2.6"` — unchanged since PR #41 (May 9 2026 security release)
- `"type": "module"` — unchanged since Sep 2025
- PR #51 only changed build scripts (e.g. `sync-github-dashboard-cache.mjs`) and dashboard UI/API code

The redeploy after merge did not introduce a new semver risk; it **rebuilt and republished** the same latent misconfiguration.

### Why smoke tests passed

Route types on `main` (representative):

| Static `○` (CDN) | Dynamic `ƒ` (Lambda) |
|------------------|------------------------|
| `/`, `/qa`, `/cv`, `/accomplishments`, … | `/x` (`force-dynamic`), `/api/*`, `/certificates`, `/content-hub/[page]` |

Testing homepage, `/qa`, or `/cv` after merge can look fully healthy while `/x` or API routes 500. Logs may show many `_rsc` failures when users hit dynamic surfaces or when navigation triggers server paths.

Upstream reports also describe **intermittent** failure on small repos until a redeploy or platform rollout makes the missing `.next/package.json` boundary visible ([next.js#91661](https://github.com/vercel/next.js/issues/91661), [discussion #91663](https://github.com/vercel/next.js/discussions/91663)).

---

## Timeline (this repository)

| When | What |
|------|------|
| Sep 2025 | `"type": "module"` added (`aff63d55`) with Next 15.x |
| Mar 26 2026 | Next bumped `16.0.10` → `16.2.1` |
| May 9 2026 | Next pinned to `16.2.6` (security release, PR #41) |
| May 28 2026 | PR #50 merged (QA reactor) — same `16.2.6` + `"type": "module"` |
| May 31 2026 | PR #51 merged (GitHub dashboard) — still same stack; production issue surfaced on dynamic routes |

---

## What does *not* fix it

- Changing page code or RSC patterns (the chunk format is already CJS).
- Relying on local `pnpm build` green — build output is correct; the bundle on Vercel is not.
- `NODE_OPTIONS=--experimental-require-module` on Vercel — runtime may inject `--no-experimental-require-module`, overriding the env var (see upstream issues).
- **Removing or disabling RSC** — see below.

### Why not “remove all RSC” instead of removing `"type": "module"`?

**No.** Dropping RSC would not fix this outage and is the wrong lever.

**What actually breaks** is Node module format + Vercel’s launcher, not RSC:

```
___next_launcher.cjs  →  require('.next/server/app/.../page.js')
                              ↑
                    Misclassified as ESM when root package.json has
                    "type": "module" and .next/package.json is missing
                    from the Lambda bundle
```

That path runs for **any** App Router server work on Vercel: dynamic pages, Route Handlers (`/api/*`), RSC flight requests (`?_rsc=…`), and similar. Built `page.js` files are already CommonJS (`require`, `module.exports`).

**What “remove all RSC” would mean** in practice:

- Migrating the whole app to **Pages Router**, or
- Making routes entirely **`"use client"`** and giving up SSR/streaming for those surfaces

That is a large rewrite. You would still ship `.next/server/**/*.js` into Lambda with the same `___next_launcher.cjs` and the same `"type": "module"` resolution bug. **API routes are not “RSC UI”** but they use the same server bundle and launcher — they would still 500 with `ERR_REQUIRE_ESM` until module resolution is fixed.

**What `?_rsc=…` means:** the client requesting a **flight payload** during App Router navigation. It is normal behavior. Logs mention it because that request loads a server chunk; the crash is `require()` + ESM misclassification, not “RSC is enabled.”

| Approach | Fixes production? | Cost |
|----------|-------------------|------|
| Remove `"type": "module"` | Yes (verified by `scripts/verify-vercel-esm-resolution.mjs`) | One field in `package.json` |
| Ensure `.next/package.json` in every Vercel function bundle | Yes (platform-side) | Wait on Vercel/Next |
| Remove / disable RSC | **No** — same launcher and bundle issue | Massive architectural change |

---

## Fix

### Recommended: remove root `"type": "module"`

This repo does not need it:

- Next config: `next.config.mjs`
- Scripts: `scripts/*.mjs`
- App source: TypeScript compiled by Next

Remove the field from `package.json`:

```diff
   "private": true,
-  "type": "module",
   "scripts": {
```

Redeploy to Vercel. No Next downgrade required.

### Alternatives

| Option | Tradeoff |
|--------|----------|
| Pin `next` to **16.1.7** | Restores deployments for some setups; blocks security patches on 16.2.x |
| Wait for Vercel/Next fix | Ensure `.next/package.json` is always in the Lambda bundle, or launcher uses `import()` |
| Custom `vercel-build` hook | Fragile; copy/write `.next/package.json` into the artifact if missing — prefer removing `"type": "module"` |

---

## Verification after fix

### Local simulation (no Vercel deploy)

After `pnpm build`:

```bash
node scripts/verify-vercel-esm-resolution.mjs
```

Expected:

- `WITH type:module, WITHOUT .next/package.json` → `ESM-scope` or `ERR_REQUIRE_ESM` (broken)
- `WITHOUT type:module, WITHOUT .next/package.json` → `MODULE_NOT_FOUND` (CJS load started; missing turbopack runtime in sandbox is OK)
- `WITH type:module, WITH .next/package.json` → `MODULE_NOT_FOUND` or `require-ok` (boundary file works)

### Production

1. `pnpm build` — should still succeed; `.next/package.json` should still contain `{"type":"commonjs"}`.
2. `pnpm type-check` / `pnpm lint` — unchanged.
3. Deploy to Vercel; hit **dynamic** routes explicitly:
   - `/x` (hard refresh, not just client nav from static pages)
   - `/api/cv/qa` (POST)
   - Any other `ƒ` route from the build output table
4. Confirm runtime logs no longer show `ERR_REQUIRE_ESM` from `___next_launcher.cjs`.

---

## References

- [next.js#91661](https://github.com/vercel/next.js/issues/91661) — `ERR_REQUIRE_ESM` on Vercel with `"type": "module"` (16.2.x)
- [next.js discussion #91663](https://github.com/vercel/next.js/discussions/91663) — `___next_launcher.cjs` + root `"type": "module"`
- [next.js#91740](https://github.com/vercel/next.js/issues/91740) — regression analysis vs 16.1.x / `#86434`
- [Vercel changelog: Next.js May 2026 security release](https://vercel.com/changelog/next-js-may-2026-security-release) — context for upgrading to `16.2.6`

---

## One-line summary

**Production broke because Vercel’s CJS launcher could not `require()` server chunks when root `"type": "module"` overrode missing `.next/package.json` in the 16.2 Lambda bundle — not because RSC or a recent feature PR changed runtime dependencies.**
