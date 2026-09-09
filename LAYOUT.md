# Layout — recursive φ-flow (operator SoT)

Native CSS only. Document flow owns layout. Zero layout JavaScript dependencies. Pretext is not in this PR.

**North star:** At every depth, major:minor ≈ **φ (1.618)** unless a named exception applies.

See [PLAN.md](PLAN.md) for keep/leave, section recipes, derive shape, and the 8 optical marks.

---

## Data vs derived

| Layer | Source | Rule |
|-------|--------|------|
| **cvdata** | Textual SoT | Every statement about the person. Keys identify facts. Name stays **`cvdata`**. |
| **Derived** | `src/lib/hire-layout-derived.ts` | Web-only pack modes, column counts, reach scope, hero peek, CTA hierarchy. Pure functions — facts never fork. |
| **UI + CSS** | `HireLanding` + `hire-phi-flow.css` | Renders the plan. **No fixed span classes in JSX as layout authority.** |

Pipeline: **cvdata → getHireContent() → deriveHireLayout() → CSS hooks**.

---

## Domain tree

```
RouteBand → Section → Cluster → Cell → Mark
```

| Level | Role | Default display | Ratio law |
|-------|------|-----------------|-----------|
| **RouteBand** | Shared max-width + inset | block flow | φ gap tokens |
| **Section** | `#home` `#about` `#systems` `#work` `#contact` | block flow | `--phi-gap-4` |
| **Cluster** | Hero split, proof bento, evidence pack | grid / columns / flex | `@container` on cluster |
| **Cell** | Proof card, claim card | auto-fit / column item | no JSX span weights |
| **Mark** | Headings, CTA row, `data-lcv` | flex item | must-show never orphaned |

---

## φ-flow

1. Identify depth (RouteBand → Mark).
2. Two tracks → `1.618fr 1fr` (or inverse).
3. Gaps from `--phi-gap-*` only.
4. Clusters declare `container-type: inline-size`.
5. Media queries only for named LCV viewports or the contact-split exception.

```css
--phi: 1.618;
--phi-gap-0: 0.382rem;
--phi-gap-1: 0.618rem;
--phi-gap-2: 1rem;
--phi-gap-3: 1.618rem;
--phi-gap-4: 2.618rem;
--phi-gap-5: 4.236rem;
```

---

## Display defaults

| Pattern | When | Mechanism |
|---------|------|-----------|
| Block flow | Prose, section stacks | default |
| Flex | CTA rows, channel rows | wrap; one primary + text secondaries |
| Grid φ-split | Hero | `.phi-split` |
| Auto-fit dense | Proofs | `repeat(auto-fit, minmax(var(--hire-proof-min), 1fr))` |
| CSS columns | Evidence | `data-evidence-cols` from derive |
| Stack | Systems (default) | pair only when derive says balanced |

---

## Alignment invariants

1. Shared max-width + inset (`.phi-route-band`, 80rem).
2. Shared start line — section titles and hero name share the band edge.
3. No orphan CTA rows — primary + secondaries are one flex group.
4. No wasted major voids — no rigid Product \| Development columns.
5. **Reach on link/action rows only** — hero reach + evidence links: center → end. **Never** on proof grids or proof prose.
6. Single `#main` from root layout.
7. Must-show: name, thesis, contact heading (`data-lcv="must-show"`).

---

## Named exceptions

| Exception | Ratio | Reason |
|-----------|-------|--------|
| Systems graph SVG | fixed `viewBox` | Diagram, not typographic φ |
| Auto-fit proofs | `repeat(auto-fit, minmax(...))` | Derived dense pack |
| Contact form / channels | `1fr 1fr` from 768px | Named: `contact-split` |

---

## Production path

- **One hire surface:** `/` (`HireLanding`)
- **No** `/lab/landing-*` skins in this PR

---

## Verification

```bash
pnpm layout:phi-check
pnpm taste:check
```
