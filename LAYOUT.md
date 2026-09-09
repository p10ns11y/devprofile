# Layout — recursive φ-flow (operator SoT)

Native CSS only. Document flow owns layout; GPU aesthetics (gradients, blur, motion) never own structure. Zero layout JavaScript dependencies.

**North star:** At every depth, major:minor track ratio ≈ **φ (1.618)** unless a named exception applies. Stable, precise, mathematical — not quirky fixed span choreography.

---

## Data vs derived

| Layer | Source | Rule |
|-------|--------|------|
| **cvdata** | Textual SoT | Every statement about the person. Keys identify facts. Name stays **`cvdata`**. |
| **Derived** | `hire-layout-derived.ts` | Web-only pack modes, column counts, reach scope, hero peek, CTA hierarchy. Pure functions — facts never fork. |
| **UI + CSS** | `HireLanding` + `hire-phi-flow.css` | Renders the plan. **No fixed span classes in JSX as layout authority.** |

Pipeline: **cvdata → hire-content → deriveHireLayout → CSS hooks**.

---

## Domain tree

```
RouteBand → Section → Cluster → Cell → Mark
```

| Level | Role | Default display | Ratio law |
|-------|------|-----------------|-----------|
| **RouteBand** | Page shell: shared max-width + horizontal inset | block flow | band padding uses φ gap tokens |
| **Section** | Landmark region (`#home`, `#about`, `#systems`, `#work`, `#contact`) | block flow | section gap = `--phi-gap-4` |
| **Cluster** | Grouping inside a section (hero split, proof bento, evidence families) | grid or flex | major:minor ≈ 1.618; `@container` queries on cluster |
| **Cell** | One proof card, graph panel, claim row | block / auto-fit cell | dense pack — no JSX span weights |
| **Mark** | LCV `data-lcv` targets, headings, CTA row | inline / flex item | must-show never orphaned by layout |

---

## φ-flow algorithm

1. **Pick depth** — identify RouteBand → … → Mark for the element.
2. **Assign tracks** — split parent into major + minor where two columns exist: `grid-template-columns: 1.618fr 1fr` (or inverse when secondary leads visually).
3. **Gap series** — use `--phi-gap-*` tokens (see below); never arbitrary pixel stacks.
4. **Container queries** — clusters declare `container-type: inline-size`; switch column count at cluster width, not page width alone.
5. **Media queries** — only for LCV named viewports when cluster queries cannot express the break:
   - **phone-short** 375×667
   - **phone** 375×812
   - **tablet** 768×1024
   - **desktop** 1280×720
6. **Verify** — `pnpm lcv:probe` on production path × all named viewports; zero `fail: true` on must-show marks.

---

## CSS primitives (hire φ-flow)

Implemented in `src/styles/hire-phi-flow.css`:

| Class | Purpose |
|-------|---------|
| `.phi-route-band` | Shared max-width (`80rem`) + `--marketing-inset-x` |
| `.phi-section` | Vertical rhythm + scroll-margin for fixed header |
| `.phi-split` | Grid major:minor ≈ 1.618fr / 1fr from tablet cluster width up |
| `.phi-split--inverse` | Minor leads left: `1fr 1.618fr` |
| `.phi-cluster` | `container-type: inline-size` wrapper |
| `.hire-phi__proofs--auto-fit` | Dense auto-fit proof grid (derived min cell width) |
| `.hire-phi__systems--stack` | Single-column systems pack (default) |
| `.hire-phi__evidence-pack` | CSS columns — dense card flow; no rigid family columns |
| `.hire-phi__hero--peek` | Shorter hero — next section heading peeks in first viewport |
| `.hire-phi__hero-reach` | Hero actions + social: center (narrow) → end (wide); **not** proofs |
| `.hire-phi__interactives` | Evidence link rows only — center (narrow) → end (reach zone) |
| `.phi-gap-*` | Margin/padding utilities bound to gap tokens |

### Gap tokens (φ series, rem)

```css
--phi: 1.618;
--phi-gap-0: 0.382rem;   /* 1/φ² */
--phi-gap-1: 0.618rem;   /* 1/φ */
--phi-gap-2: 1rem;
--phi-gap-3: 1.618rem;
--phi-gap-4: 2.618rem;
--phi-gap-5: 4.236rem;
```

---

## Display mode defaults

| Pattern | When | Mechanism |
|---------|------|-----------|
| **Block flow** | Prose, section stacks, evidence lists | default |
| **Flex** | CTA rows, contact channels | `flex-wrap`; one primary + text secondaries |
| **Grid φ-split** | Hero, balanced systems aside | `.phi-split` when derived says balanced |
| **Auto-fit dense** | Proof cards | `.hire-phi__proofs--auto-fit` — `repeat(auto-fit, minmax(...))`; **no span-8/span-4 in JSX** |
| **CSS columns / dense** | Evidence cards with uneven family counts | `.hire-phi__evidence-pack` — flows cards; family as per-card eyebrow |
| **Masonry / dense** | Card heights vary materially | `@supports (grid-template-rows: masonry)` on bento only; fallback is dense auto-rows |

---

## Alignment invariants

1. **Shared max-width + inset** — all sections use `.phi-route-band` (same cap as site chrome).
2. **Shared start line** — section titles and hero name align to one left edge within the band.
3. **No orphan CTA rows** — primary + secondaries wrap as one flex group; never a lone button on its own row at desktop when avoidable.
4. **No wasted major voids** — do not split uneven content into rigid equal columns (e.g. Product | Development) that leave a tall empty gutter; use CSS columns, dense grid, or single flow so cards pack.
5. **Interactive reach zone** — hero action row + evidence link rows align **center on narrow clusters**, **end (right) from ~20–28rem cluster width**. Prose and proof body stay start-aligned; **never** apply reach to proofs grid containers.
6. **Single `#main`** — from root layout; page content lives inside, never nested `<main>`.
7. **Must-show marks** — thesis + contact heading carry `data-lcv="must-show"`.

---

## Named exceptions (document only)

| Exception | Ratio | Reason |
|-----------|-------|--------|
| Systems graph SVG | fixed `viewBox` aspect | Semantic diagram, not typographic φ |
| Auto-fit proof grid | `repeat(auto-fit, minmax(...))` | Derived dense pack — no JSX spans |
| Contact form aside | 1fr 1fr @768px | Equal columns for form + channels (named: `contact-split`) |

Add new exceptions here before landing in CSS.

---

## Production path

- **Production hire surface:** `/` (φ-flow `HireLanding`)
- **Lab alias:** `/lab/hire` (same component + lab notice)
- **Stress fixtures:** `/lab/stress/*` — long strings for LCV only, not production copy
- **Retired skins:** `/lab/landing-c` … `g` redirect to `/lab/hire`; A/B redirect (archived prototypes)

---

## Verification

```bash
pnpm lcv:probe                    # all feature-map paths
VERIFY_FEATURE=/ pnpm lcv:probe   # production home
pnpm taste:check
pnpm test:lab-taste
```

Optional cheap φ lint: grep `grid-template-columns` in hire CSS for undocumented non-φ ratios.

---

## Related

- Taste rubric: `TASTE.md`
- Visual tokens: `DESIGN.md`
- Feature map: `.cursor/skills/verify-devprofile/features/home.md`
