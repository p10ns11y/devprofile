# devprofile — semantic markup & CSS overlay

Load with [SKILL.md](../SKILL.md) when editing this repo's marketing UI.

## Token files

| File | Role |
|------|------|
| `src/styles/brand/theme.css` | oklch brand, `surface*`, `text*`, light/dim — **fix contrast here first** |
| `src/styles/marketing.css` | `@layer components`: `[data-section]`, `[data-state]`, `[data-status]`, reduced motion |
| `src/styles/globals.css` | Imports Tailwind + theme + marketing |

Map shadcn vars (`--primary`, `--muted-foreground`, `--ring`) to brand tokens so `ui/button`, `ui/input` inherit contrast-safe colors.

## Site primitives (landing pass)

Planned under `src/components/site/`:

- `SectionShell` — `<section data-section={id} aria-labelledby={headingId}>`
- `SectionHeading` — single `h2` + optional eyebrow `<p>`
- `PageShell` — header/footer wrapper; no extra `<main>`
- `SiteButton` — shadcn `Button` + `asChild` for native `<a>`

## Layout landmarks

- `#main` only in `src/app/layout.tsx` — remove inner `<main>` from `src/app/page.tsx`
- Skip link targets `#main` (already present)

## Native patterns in this repo

| Feature | Target pattern |
|---------|----------------|
| Mobile nav | `<button aria-expanded aria-controls="site-nav-panel">` + `data-state` |
| Certificate viewer | `<dialog class="cert-dialog">` + [`useDialogFromSearchParam`](../../../src/hooks/use-dialog-from-search-param.ts) (`?id=` ↔ `showModal`). Open layout in `marketing.css` (`dialog.cert-dialog[open]`). **Never** unconditional `display:flex`/`fixed` on `<dialog>`. |
| Contact form | `<form data-status={…}>` + `role="status" aria-live="polite"` |
| Projects | `<ul>` / `<li>` / `<article data-card="project">` |

## Verify

```bash
pnpm type-check
pnpm lint
```

Manual: keyboard nav header → sections; Esc closes dialog; spot-check `text1`/`text2`/brand on `surface1`/`surface2` in light + dim.
