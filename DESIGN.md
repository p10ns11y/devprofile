# Design — devprofile visual SoT

Extracted from `src/styles/brand/theme.css`, `src/styles/marketing.css`, and `PRODUCT.md`. Impeccable-compatible reference for agents and reviewers.

## Personality

**Quiet leverage · Patient vision · Lived craft**

Editorial hierarchy and whitespace carry prestige. Cards only when they hold evidence. Restraint is the flex.

## Typography

| Role | Token / class | Usage |
|------|---------------|--------|
| Display | `--font-display` (Instrument Serif) | Name, section titles, pull quotes |
| Body | `--font-body` (DM Sans) | Prose, UI, labels |
| Eyebrow | 0.8125rem, uppercase, letter-spacing 0.06em, `--color-text-muted` | Seat, place, family labels |

Section titles: `clamp(1.75rem, 3.5vw, 2.5rem)`, display family, weight 400.

## Color

| Token | Role |
|-------|------|
| `--brand` / `--color-brand-emphasis` | Accent — links, focus, **one** primary button fill |
| `--color-surface1` | Page background |
| `--color-background-elevated` | Muted section bands |
| `--color-text1` | Body text |
| `--color-text2` | Secondary prose |
| `--color-text-muted` | Eyebrows, where-lines |
| `--color-link` | Text links (not buttons) |
| `--color-border-subtle` | Dividers — prefer hairline over brand spines |

**Primary button** (`SiteButton` variant `primary`): brand fill, `--color-accent-primary-text` label. **At most one per hero or contact action group.**

**Do not:** purple/neon gradients, glassmorphism, thick brand `border-left` on list items (résumé spine).

## Spacing

| Token | Value |
|-------|--------|
| `--marketing-inset-x` | `clamp(1rem, 4vw, 1.5rem)` |
| `--marketing-space-section-y` | `clamp(3rem, 5vw, 4rem)` |
| `--marketing-prose-max` | `40rem` |
| `--header-offset` | `5rem` desktop / `4.25rem` mobile |

Containers: `.site-container` or `lab-*__container` — `max-width: 80rem`, horizontal inset.

## Section patterns

- **Hero** (`#home`): name, role, one thesis, **one** primary CTA + **text** secondaries (`hero_links`), compact social.
- **About** (`#about`): "What you are hiring" — proofs in **auto-fit dense** grid; no fixed span weights in markup.
- **Systems** (`#systems`): evidenced graph; **stack** by default (pair only when derived says balanced).
- **Work** (`#work`): "Evidence" — CSS column pack; family eyebrow per card; links center→right.
- **Contact** (`#contact`): form + Direct channels; no Talk instead; no duplicate CV button row in aside.

## Layout derivation

Hire surfaces: `cvdata` → `getHireContent()` → `deriveHireLayout()` → CSS class hooks in `hire-phi-flow.css`. See `LAYOUT.md`.

## LCV roles in markup

| `data-lcv` | Use |
|------------|-----|
| `must-show` | h1, thesis, primary CTA label region, contact heading |
| `preview` | Card blurbs, truncated evidence, decorative maps |
| `live` | `data-visual-live` widgets |

## Accessibility

- WCAG 2.2 AA contrast on body and interactive text.
- Keyboard: form, nav, focus rings visible.
- `prefers-reduced-motion`: no required motion.
- Real labels; status via `role="status"` / `aria-live`.

## Where primary is allowed

1. Hero `hero_actions` — first action only (`variant: primary`).
2. Contact form submit — "Send message" (filled).
3. Nowhere else on hire landings without explicit design review.
