---
name: project-ide-profile
description: >-
  Generates IDE-agnostic workspace settings from a .ide/profile.json manifest:
  .vscode/settings.json, extensions.json, and Cursor workspaceOpen plugin loading.
  Use when setting up per-project extensions, Cursor plugins, editor defaults, or
  porting workspace config to new repos.
---

# Project IDE profile

Maintain a **single manifest** (`.ide/profile.json`) and generate editor files that VS Code, Cursor, and VSCodium all understand. Keeps extensions/plugins **scoped to the stack** instead of loading every global install.

**Example in this repo:** `.ide/profile.json` → run `pnpm ide:sync`.

---

## Layout

```
.ide/
  profile.json           # Project manifest (stack, extensions, cursor plugins, settings)
  defaults.settings.json # Shared baseline merged into every project
.vscode/                 # Generated — commit to git
  settings.json
  extensions.json
.cursor/                 # Generated — commit to git
  hooks.json             # workspaceOpen → load-workspace-plugins.mjs
scripts/
  sync-ide-profile.mjs   # Regenerate .vscode + .cursor/hooks.json
  load-workspace-plugins.mjs  # Hook: emit pluginPaths from profile
```

---

## Workflow checklist

```
- [ ] 1. Detect stack (package.json, configs, test runners)
- [ ] 2. Edit .ide/profile.json (extensions, cursor.plugins, settings overrides)
- [ ] 3. Run: pnpm ide:sync (or node scripts/sync-ide-profile.mjs)
- [ ] 4. Reload window; accept recommended extensions when prompted
- [ ] 5. Confirm Cursor plugins load (hooks) or install missing marketplace plugins
- [ ] 6. Commit .ide/, .vscode/, .cursor/hooks.json
```

---

## Step 1: Detect stack

| Signal | File / dep | Typical extensions | Unwanted (other stacks) |
|--------|------------|--------------------|-------------------------|
| Next.js | `next`, `next.config.*` | ESLint, sometimes Tailwind | Prettier if ESLint formats |
| React | `react`, `react-dom` | ESLint | — |
| TypeScript | `typescript`, `tsconfig.json` | ESLint; use workspace `typescript.tsdk` | — |
| Tailwind | `tailwindcss`, `@tailwindcss/postcss` | Tailwind CSS IntelliSense | — |
| Playwright | `@playwright/test`, `playwright.config.*` | Playwright | — |
| pnpm | `pnpm-lock.yaml`, `packageManager` | — | npm-only tooling |
| Python | `pyproject.toml`, `requirements.txt` | Python, Pylance | (if absent, unwanted Python) |
| Rust | `Cargo.toml` | rust-analyzer | (if absent, unwanted Rust) |
| Svelte | `svelte`, `.svelte` | Svelte + Cursor svelte plugin | — |

Do not recommend extensions for stacks the repo does not use — reduces attack surface and UI noise ([audit-ide-dependencies](../audit-ide-dependencies/SKILL.md)).

---

## Step 2: Edit `profile.json`

Minimal shape:

```json
{
  "name": "my-app",
  "stack": ["next", "typescript", "pnpm"],
  "extensions": {
    "recommend": ["dbaeumer.vscode-eslint"],
    "unwanted": ["rust-lang.rust-analyzer"]
  },
  "cursor": {
    "plugins": [
      { "name": "shadcn", "publisher": "cursor-public", "optional": true }
    ]
  },
  "settings": {
    "eslint.useFlatConfig": true
  }
}
```

- **`extensions.recommend`** → `.vscode/extensions.json` `recommendations` (VS Code/Cursor prompt to install).
- **`extensions.unwanted`** → `unwantedRecommendations` (discourage irrelevant global extensions).
- **`cursor.plugins`** → resolved under `$CURSOR_HOME/plugins/cache/<publisher>/<name>/<hash>/` by `load-workspace-plugins.mjs` on **workspaceOpen** ([Cursor hooks](https://cursor.com/docs/hooks)).
- **`settings`** → merged over `.ide/defaults.settings.json` into `.vscode/settings.json`.

---

## Step 3: Generate

```bash
pnpm ide:sync
# or: node scripts/sync-ide-profile.mjs
```

Never hand-edit generated `.vscode/settings.json` long-term — change `profile.json` and re-sync.

### Formatter / extension settings (important)

Cursor validates `editor.defaultFormatter` against **installed** extensions only. If ESLint is only *recommended* but not installed, use built-ins in `profile.settings`:

- `vscode.typescript-language-features` — TS/JS format
- `vscode.json-language-features` — JSON

Put extension-only keys in `.ide/profile.extensions.json` (merged by `ide:sync` only when that extension exists under `~/.cursor/extensions/`). Example: ESLint format-on-save and `dbaeumer.vscode-eslint` as formatter apply after installing the recommended ESLint extension and re-running `pnpm ide:sync`.

---

## Step 4: Good defaults (baseline)

`defaults.settings.json` already sets:

- 2-space indent, final newline, trim whitespace
- File nesting for `package.json` / lockfiles / configs
- TypeScript import preferences and move-update-imports
- Sensible git/terminal defaults

Override per project in `profile.settings` only when needed (e.g. `eslint.useFlatConfig`, Tailwind v4 `experimental.configFile`, Playwright reuse browser).

**devprofile** baseline: workspace TypeScript SDK, built-in TS/JSON formatters, `.next` / test output excludes. ESLint/Tailwind/Playwright keys live in `profile.extensions.json` and merge when those extensions are installed.

---

## Step 5: Cursor vs VS Code

| Feature | VS Code / Cursor | Notes |
|---------|------------------|-------|
| Workspace settings | `.vscode/settings.json` | Same JSON schema |
| Extension recommendations | `.vscode/extensions.json` | Cursor uses same file |
| Cursor marketplace plugins | `.cursor/hooks.json` + `load-workspace-plugins.mjs` | Requires plugin installed in Cursor once; hook loads cache path per workspace |
| User settings | `~/.config/Cursor/User/settings.json` | Global — do not duplicate project overrides here |

Optional: symlink agent skills per [AGENTS.md](../../../AGENTS.md); unrelated to `profile.json`.

---

## Step 6: New project / extend

1. Copy `.ide/defaults.settings.json` and `scripts/sync-ide-profile.mjs`, `scripts/load-workspace-plugins.mjs`.
2. Add `"ide:sync": "node scripts/sync-ide-profile.mjs"` to `package.json`.
3. Author `.ide/profile.json` from stack table above.
4. Run `pnpm ide:sync` and commit outputs.

For monorepos, use one profile at the root or per-package profiles with separate sync invocations (`node scripts/sync-ide-profile.mjs` from each package after adjusting paths — extend script if needed).

---

## Anti-patterns

- Putting project-only settings in global Cursor `settings.json`
- Recommending every extension you personally use globally
- Hand-editing `.vscode/settings.json` without updating `profile.json`
- Listing Cursor plugins in `profile.json` that were never installed from the marketplace (use `"optional": true` or install first)
- Running `npm audit fix` inside `~/.cursor/extensions` ([audit-ide-dependencies](../audit-ide-dependencies/SKILL.md))

## Related skills

- [audit-ide-dependencies](../audit-ide-dependencies/SKILL.md) — audit extension/plugin CVEs under `~/.cursor`
- [fix-dependency-security](../fix-dependency-security/SKILL.md) — project `pnpm audit`, SFW installs

## References

- [VS Code workspace settings](https://code.visualstudio.com/docs/editor/workspaces)
- [Extension recommendations](https://code.visualstudio.com/docs/editor/extension-marketplace#_workspace-recommended-extensions)
- [Cursor hooks — workspaceOpen](https://cursor.com/docs/hooks)
- [Cursor plugins](https://cursor.com/docs/plugins)
