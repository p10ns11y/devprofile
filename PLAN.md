# Hire landing — revised plan (PR from main)

**Vehicle:** new branch off `main`. PRs #100 and #101 are **prototypes only** — not the ship branch.

Pipeline: **cvdata (facts) → hire-content (web body) → deriveHireLayout (web-only plan) → CSS hooks → HireLanding at `/`**.

Pretext (`@chenglou/pretext`) is **out** unless CSS packing later needs measured heights. Native CSS (`@container`, `auto-fit`, `columns`, φ gaps) owns layout.

---

## Keep from prototypes (obvious only)

| From | Keeper |
|------|--------|
| #100 | Distilled `cvdata.landing` copy; quiet CTAs (no Talk-instead on `/`); one filled button + text secondaries; `hero_links` |
| #101 | LAYOUT / TASTE / DESIGN intent; data → derived → UI; auto-fit proofs; CSS-column evidence pack; φ gap tokens; hero peek; scoped reach; channel rows without “XChat”; Lucide icons typed as `ComponentType<{ className?: string }>` |

## Leave behind

- Lab letter skins A–G and `/lab/hire` as competing landings
- Stub / theater `deriveHireLayout` (constants that ignore content)
- `.hire-phi__interactives` on proof grids (PROOF prose right-align bug)
- Fixed `span-8` / `span-4` as layout authority
- Vendored LCV + stress fixtures as a ship requirement (gates-green-alone already failed optically)
- Invented graph nodes (e.g. `life-os` is not in `cvdata.projects`)
- Half-merged Talk / old-home patches on unused hero/contact
- Coach/meta lab notices on production `/`

---

## Section recipes (production `/` only)

1. **Hero `#home`** — φ-split cluster (`@container`). Left: `Available now · Stockholm`, name, role. Right: seat + thesis **start-aligned**. Under that, **one packed CTA cluster** (Building + View CV · Q&A · Articles + social), `width: fit-content`, **centered**. End-align the packed cluster only if center orphans a leftover row. Never `width: 100%` + `flex-end` / `space-between`. Hero is content-tall, not `100vh`, so the next heading peeks.
2. **Proofs `#about`** — “What you are hiring”. Auto-fit dense cards (`minmax(var(--hire-proof-min), 1fr)`). Eyebrow `PROOF NN` end-aligned; title + prose **start-aligned**. Repo links are in-card text, **not** reach/interactives.
3. **Systems `#systems`** — Evidenced graph + legend. Nodes/edges only from `cvdata` projects + the cvdata hub. Stack by default; pair only when derive says the disclaimer is short **and** the legend is light.
4. **Evidence `#work`** — CSS `columns` pack. Family is a per-card eyebrow (no Product | Development void). Link rows may use reach; body text stays start-aligned.
5. **Contact `#contact`** — Named exception: equal columns from 768px. Form + Direct channels. No Talk CTAs, no duplicate CV row. Each channel is a **tight row**: icon + label/value with a φ gap — not icon at one edge and text at the other. X: icon + `@handle` only.

Academic / course proofs stay on `/certificates` (not a sixth landing section).

---

## Derive shape

`deriveHireLayout(content)` is a **pure function of content shape**:

| Input | Output |
|-------|--------|
| `heroActions` primary label | `hero.primaryAction` (not a hardcoded string) |
| proof count | `proofs.minCell` (wider cells when fewer cards) |
| evidence card + href counts | `evidence.counts` + whether `evidence-links` is in `interactives.scopes` |
| systems node count + disclaimer length | `systems.mode` `stack` \| `stack-pair` |
| presence of hero actions/links | `hero-reach` in scopes |

**Never** put `proofs` in `interactives.scopes`. Facts stay in cvdata; derive never rewrites copy.

CSS maps the plan: `--hire-proof-min`, `data-evidence-cols`, `data-hero-peek`, pack class names. No JSX span choreography.

---

## Optical checklist (8 marks)

Operator SoT: attached marks (do not edit). Gates green alone is not enough.

| # | Mark | Pass |
|---|------|------|
| 1 | Building main, CV secondary | Primary filled button = Building; View CV is a text link |
| 2 | Right-container CTAs aligned | Packed cluster **centered** under thesis; social sits with the CTAs — not stranded at the far right |
| 3 | Hero shorter than the fold | `#about` heading (“What you are hiring”) peeks in a 1280×720 first viewport |
| 4 | Proof prose not right-aligned | `.hire-phi__proof-line` / titles `text-align: start`; no interactives class on the grid |
| 5 | Content-led pack | `auto-fit` / `columns`; grep-clean of `span-8`/`span-4` in hire JSX |
| 6 | No “XChat” | X channel is icon + `@handle` — label does not need explaining |
| 7 | Channel rows | Icon + text packed with a small gap; no `space-between` void |
| 8 | No wasted major voids | Evidence is column-pack; systems stack when the legend is heavy |

---

## Verification

```bash
pnpm type-check
pnpm lint
pnpm test:unit
pnpm build
pnpm layout:phi-check
pnpm taste:check
```

Playwright (Brave Beta, when available): `tests/e2e/homepage.spec.ts`.

Optical: screenshot `#home`+`#about` peek, proof cards, evidence pack, Direct channels — desktop 1280 and phone 375 — against the attached marks.

---

## Public copy

Orwell + honesty: every production sentence traces to **cvdata** (or sourced project URLs). One production `/`. No Steward/coach voice.
