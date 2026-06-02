---
name: semantic-markup-css
description: Guides modern HTML semantics, WAI-ARIA, WCAG contrast, data-* state attributes, and native elements over div-heavy UI; pairs Tailwind with modern CSS where CSS wins. Use before marketing/UI refactors, landing pages, forms, dialogs, nav, or when the user mentions semantics, WAI-ARIA, accessibility, data attributes, native elements, color contrast, or modern CSS.
---

# Semantic markup & modern CSS

**Load first** on marketing UI, layout refactors, or any task touching TSX + styles. Pair with [react-client-expert](../react-client-expert/SKILL.md) for client state; this skill owns **HTML, ARIA, tokens, and CSS architecture**.

**devprofile overlay:** [references/devprofile-marketing-css.md](references/devprofile-marketing-css.md)

---

## Decision order (always)

1. **Native element** — can `<button>`, `<a>`, `<dialog>`, `<details>`, `<address>`, `<figure>`, `<ul>`/`<ol>` do the job?
2. **Semantics + one heading level** — correct landmark/section/article; single `h1`, section `h2`, card `h3`
3. **WAI-ARIA only to fill gaps** — prefer native semantics; don't duplicate what HTML already exposes
4. **`data-*` state in DOM** — style with CSS; avoid parallel `isOpen && "block"` class soup
5. **Token/contrast fix** — adjust CSS variables before per-component color hacks
6. **Tailwind for layout/type** — spacing, grid, responsive; **CSS for** scroll-margin, `:has()`, `@container`, `color-mix`, reduced motion

---

## Semantic HTML

| Job | Use | Avoid |
|-----|-----|-------|
| Page regions | One `<main>`; `<header>`, `<footer>`, `<nav aria-label="…">` | Nested `<main>`; `<div onClick>` navigation |
| Sections | `<section id="…" aria-labelledby="…-heading">` + one `<h2 id="…-heading">` | `<div id="…">` with orphan headings |
| Cards / items | `<article>`; link via `<a>` on title or card wrapper | `<motion.div>` as the interactive root |
| Lists | `<ul role="list">` / `<ol>` | Flex divs of `<span>` |
| Contact | `<address>` (reset italic in CSS) | Div stacks |
| Media | `<figure>` + `<figcaption>` or `sr-only` caption | Decorative div-only portrait |
| Overlays | `<dialog>` + `<form method="dialog">` close | Fixed `<div>` + manual focus trap (unless Radix already standardized) |
| Expand/collapse | `<details>` / `<summary>` when no heavy JS state | Custom div accordion |

**Buttons vs links:** navigation → `<a href>`; in-page actions → `<button type="button">`. Never `<div role="button">`.

---

## WAI-ARIA (minimal)

- **Landmarks:** `aria-label` on `<nav>` when multiple (`Primary`, `Footer`, `Social`)
- **Disclosures:** `aria-expanded`, `aria-controls` on menu triggers; panel `id` matches
- **Current page/section:** `aria-current="page"` or `"location"` where accurate
- **Live feedback:** `role="status" aria-live="polite"` for form/async messages; `aria-busy="true"` on loading regions
- **Decorative:** `aria-hidden="true"` on icons; meaningful controls keep visible text or `aria-label`
- **Invalid fields:** native `aria-invalid` + visible error text linked via `aria-describedby`
- **Dialogs:** `aria-labelledby` → dialog title; prefer native `<dialog>` focus behavior

Do **not** add redundant roles (`role="navigation"` on `<nav>`) or label with ARIA what visible text already provides.

---

## Color contrast (WCAG 2.2 AA)

Fix at **token layer** (`theme.css` / design tokens), not one-off utilities.

| Pair | Target |
|------|--------|
| Body text on surface | ≥ 4.5:1 |
| Large text (≥18px / 14px bold) | ≥ 3:1 |
| UI components & focus ring | ≥ 3:1 vs adjacent colors |
| Muted/meta copy | ≥ 4.5:1 if used for essential info; otherwise keep non-essential only |

Verify **both** theme variants (e.g. light + dim). Document adjusted token values in a short comment.

---

## `data-*` state conventions

Expose UI state in HTML; style in CSS `@layer components`:

| Attribute | Values | Use |
|-----------|--------|-----|
| `data-section` | section id slug | Anchor scroll-margin, section-scoped CSS |
| `data-state` | `open` \| `closed` | Menus, dialogs, panels |
| `data-status` | `idle` \| `loading` \| `error` \| `success` | Forms, async blocks |
| `data-card` | `project`, `credential`, … | Card variants |
| `data-action` | `open`, … | Card interaction (e.g. whole-card opens cert modal) |
| `data-grid` | `featured`, `catalog` | Credentials grid layout |
| `data-align` | `center` | Subsection heading alignment |
| `data-cta` | `icon` | Compact icon-only credential CTA |
| `data-empty` | (presence) | Date spacer when no completion date |
| `data-featured` | `true` | Bento emphasis (boolean presence) |

**React:** set attributes from reducer/status enum; **don't** mirror the same state in redundant class toggles.

Example CSS (few lines, high leverage):

```css
@layer components {
  [data-section] { scroll-margin-top: var(--header-offset, 5rem); }
  [data-state="closed"] { display: none; }
  [data-status="loading"] { pointer-events: none; opacity: 0.7; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

---

## Tailwind vs modern CSS

| Concern | Prefer |
|---------|--------|
| Fixed header + anchor links | `--header-offset` + `[data-section] { scroll-margin-top }` |
| Card hover/focus ring | `article:has(a:focus-visible)`, `@media (hover: hover)` |
| Themed hover on oklch/hsl tokens | `color-mix(in oklch, var(--brand) 90%, black)` as `--brand-hover` |
| Bento / responsive card areas | `@container` queries on section wrapper |
| Spacing, flex/grid, type scale | Tailwind utilities |
| Focus visible | `focus-visible:outline` / ring utilities + tokenized `--ring` |

**Goal:** many fixes = token tweak + 3–5 lines CSS, not 20 new classes per component.

---

## Workflow (before editing TSX)

```
- [ ] Read target component + parent layout (landmarks, heading order)
- [ ] Grep for nested <main>, div-onClick, role="button", orphan tokens
- [ ] List states → map to data-* + native elements
- [ ] Contrast-check affected text/surface pairs in all themes
- [ ] Implement: semantics first, then CSS layer, then Tailwind layout
- [ ] Verify: keyboard tab order, Esc on dialog, lint/type-check
```

---

## Anti-patterns (reject)

```tsx
// ❌ Div button
<div role="button" tabIndex={0} onClick={…}>

// ✅
<button type="button" onClick={…}>

// ❌ State in classes only
<div className={isOpen ? "block" : "hidden"}>

// ✅
<nav data-state={isOpen ? "open" : "closed"} aria-expanded={isOpen}>

// ❌ Muted token for body copy (contrast fail)
<p className="text-text2">{longParagraph}</p>

// ✅ Body on text1; text2 for meta only
```

---

## Done when

- [ ] One `<main>`; sections use `aria-labelledby`
- [ ] Interactive controls are native `<button>` / `<a>` / `<dialog>`
- [ ] Stateful UI exposes `data-*` (or native `open` on `<details>`/`<dialog>`)
- [ ] Contrast-sensitive pairs pass AA in all active themes
- [ ] `:has()` / scroll-margin / reduced-motion handled in CSS where applicable
- [ ] No new div-only patterns where semantic elements suffice

---

## Related

- Client state/fetch: [react-client-expert](../react-client-expert/SKILL.md)
- devprofile tokens/paths: [references/devprofile-marketing-css.md](references/devprofile-marketing-css.md)
