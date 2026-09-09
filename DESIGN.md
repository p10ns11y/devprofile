# Design — devprofile visual SoT

Extracted from `src/styles/brand/theme.css`, `src/styles/marketing.css`, and `PRODUCT.md`.

## Personality

**Quiet leverage · Patient vision · Lived craft**

Editorial hierarchy and whitespace carry prestige. Cards only when they hold evidence. Restraint is the flex.

## Typography

| Role | Token / class | Usage |
|------|---------------|--------|
| Display | `--font-display` (Instrument Serif) | Name, section titles, thesis |
| Body | `--font-body` (DM Sans) | Prose, UI, labels |
| Eyebrow | 0.8125rem, uppercase, tracking 0.06em, `--color-text-muted` | Place, PROOF NN, family |

Section titles: `clamp(1.5rem, 3vw, 2rem)`, display family, weight 400.

## Color

| Token | Role |
|-------|------|
| `--brand` / `--color-brand-emphasis` | **One** primary button fill, links, focus |
| `--color-surface1` | Page background |
| `--color-background-elevated` / surface2 mix | Muted bands |
| `--color-text1` | Body |
| `--color-text2` | Secondary prose |
| `--color-text-muted` | Eyebrows, where-lines |
| `--color-link` | Text links |
| `--color-border-subtle` | Hairline dividers — not brand spines |

**Do not:** purple/neon gradients, glassmorphism, thick brand `border-left` on list items.

## Spacing

φ gaps live on `.hire-phi` (`--phi-gap-0` … `--phi-gap-5`). Band inset: `--marketing-inset-x`. Header offset: `--header-offset`.

## Where primary is allowed

1. Hero `hero_actions` — first action only (`variant: primary`) → **Building**.
2. Contact form submit — “Send message”.
3. Nowhere else on `/` without design review.

## LCV roles in markup

| `data-lcv` | Use |
|------------|-----|
| `must-show` | h1, thesis, contact heading |
| `preview` | Evidence blurbs |

## Accessibility

WCAG 2.2 AA on body and interactive text. Keyboard form + nav. `prefers-reduced-motion`. Real labels. Form status via `role="status"`.
