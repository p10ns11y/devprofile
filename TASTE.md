# Taste — operator SoT (agents + critics)

Binds **his** principles to pass/fail gates. Not a generic portfolio essay. Public pages follow **copy law** below; this file is for operators and agents only.

**North star:** Quiet leverage · Patient vision · Lived craft — warm senior engineer, dry wit, Orwell brevity, proof over adjectives. Goal: **respect + curiosity** (“I want the next answer”), not hype.

---

## Pass tells (ship)

| # | Principle | Pass looks like |
|---|-----------|-----------------|
| 1 | Quiet leverage | Calm hierarchy; wit in copy, not chrome; one thesis line earns the scroll |
| 2 | Connected systems | Glanceable **graph** (nodes + labeled edges) or equivalent; not a toy pile |
| 3 | Depth glanceable | Outsider can see *how* cvdata → devprofile → collab-finder → ensembly connect without a wall of prose |
| 4 | Restraint | **Building** primary button; **View CV** text secondary; no Talk-instead stacks; no dual filled buttons |
| 5 | Editorial | Type + whitespace carry prestige; evidence in rows/cards with hierarchy — not SaaS metric tiles, purple/neon AI skin, glassmorphism, identical icon grids |
| 6 | Receipts | Figures, where-lines, repo links from **cvdata / shipped** only; honest OSS vs employment scope |
| 7 | Viewports | Must-show unclipped @ phone-short 375×667, phone, tablet, desktop; `document` overflow-x = 0; LCV stress on must-show OK |
| 7b | Space discipline | Evidence packs dense — no rigid family columns with tall empty gutter |
| 7c | Reach | Hero actions + evidence links center→right; proof prose start-aligned; channels icon+label+value in one row |
| 8 | Product voice | Hire-visitor readable; first-person where he speaks; no Steward/coach/meta (“this page proves…”, “designed for reviewers”) |
| 9 | Agent-verifiable | `data-lcv` marks, feature-map paths, `pnpm lcv:probe`, `pnpm test:lab-taste`, `DESIGN.md` tokens |
| 10 | Subtract first | Remove Talk CTAs and text walls before adding new layout chrome |

---

## Fail tells (reject or rework)

| Tell | What it looks like | Fix recipe |
|------|-------------------|------------|
| Vibe-coding demo pile | Unconnected repo cards, “Ask me anything ✨”, chat-wrapper hero | Replace with evidenced graph or delete |
| Manifesto wall | Numbered philosophy columns above the fold; beige editorial with no systems line | Cut to thesis + graph; move detail to CV/shipped |
| Résumé red-spine list | Thick brand `border-left` + 01–04 numbers + LinkedIn-ese headings | Hairline dividers or family labels; see home `.hire-proof` anti-ref |
| Dual equal CTAs | Two filled buttons in hero/contact | One `primary`; rest `secondary` / `outline` |
| Talk-instead stack | Voice / Talk in hire hero or contact | Voice lives on `/call`; subtract from hire surfaces |
| SaaS metric dashboard | Big number + tiny label grids without artifacts | One figure per receipt with where-line |
| Purple/neon AI chrome | Gradients, sparkles, glassmorphism | Brand tokens only; see `DESIGN.md` |
| LinkedIn-ese | Passionate, synergy, thought leader | cvdata-grounded lines; delete adjectives |
| Identical card grid | Same-weight tiles shouting | One editorial lead + varied proof weights |
| Wasted major void | Rigid two-column family split (tall Product, short Development) with empty gutter | CSS-column evidence pack; family as card eyebrow |
| Left-tucked interactives | Source/GitHub links hugging cell start | `.hire-phi__interactives` on evidence links + `.hire-phi__hero-reach` — not proofs grid |
| Proof prose end-aligned | Right-aligned proof body from reach leak | Remove interactives from proofs; `.hire-phi__proof-link` start-aligned |
| Awkward channel label | “XChat” or stacked label/value with wide gutter | Row: icon · label · value; label `X` + `@handle` |
| Fixed span choreography | `span-8`/`span-4` in JSX as layout authority | Derived auto-fit + CSS dense pack |
| Invented graph node | Project not in cvdata/shipped | Remove node or edge |
| Coach/meta copy | Sentence only makes sense to Steward ↔ operator | Rewrite for hire visitor or delete |
| Nested `<main>` | Invalid landmark tree | Single `#main` from layout; lab content in `.lab-main` |
| Must-show clipped | LCV `fail: true` inner-clip / occlusion | One recipe per kind; re-probe path × viewport |

---

## Viewport law

Named viewports only (LCV `VIEWPORTS`):

- **phone-short** 375×667  
- **phone** 375×812  
- **tablet** 768×1024  
- **desktop** 1280×720  

**Fail:** must-show clipped, document `overflow-x`, missing landmarks, occlusion under fixed header, scroll-trap.  
**OK-info:** preview-role inner overflow (`data-lcv=preview`, line-clamp on card blurbs).

```bash
pnpm lcv:probe
VERIFY_FEATURE=/lab/landing-d pnpm lcv:probe
pnpm taste:check   # findings JSON: zero fail:true
```

---

## Systems-story law

1. **One operator system** — memory, gates, receipts that compound; not separate demos with copied prompts.  
2. **cvdata** is the hub when shown — site, PDFs, packs read one file.  
3. **Edges must be labeled** — “gates before promote”, “one source, no drift”, not decorative lines.  
4. **Honest scope** — March–August 2026 slice for personal OSS; Oneflow ≠ lab employment.  
5. **No participatory-mesh / EEaaS claims** unless sourced in cvdata (timeline may cite IEEE; do not inflate).

Prefer **D-style map**, **F-style timeline**, or **shared evidence panel** over a seventh template skin.

---

## Copy law (public pages only)

- Hire-visitor readable; Orwell brevity.  
- If a sentence only makes sense as Steward talking to him → **does not ship**.  
- No coach meta on the website.  
- Impressive lines answerable from cvdata, golden Q&A, or shipped walkthroughs.

---

## Layout ratio law

- **cvdata stays textual SoT** — do not rename; derived layout never forks facts.
- **Recursive φ** — major:minor ≈ 1.618 at RouteBand → Section → Cluster → Cell unless listed in `LAYOUT.md` named exceptions.
- **Auto-fit over fixed spans** — no `span-8`/`span-4` choreography in JSX; CSS `auto-fit` / column pack decides density.
- **Native CSS only** — block flow default; flex for CTA/channel rows; grid for φ splits; masonry only where card heights vary.
- **Container queries on clusters**; media queries only for LCV named viewports (phone-short, phone, tablet, desktop).
- **Alignment invariants** — shared max-width + inset, shared start line, no orphan CTA rows, **no wasted major voids**, **interactive reach center/right**; single `#main`.
- **Zero layout JS deps** — GPU aesthetics never own document flow. Spec: `LAYOUT.md`.

---

## Content law

Orwell’s six rules, adapted for hire copy:

1. Never use a long word where a short one will do.  
2. If it is possible to cut a word out, always cut it out.  
3. Never use the passive where you can use the active.  
4. Never use a foreign phrase, jargon word, or buzzword if you can think of an everyday English equivalent.  
5. Never use a figure of speech you are used to seeing in print.  
6. Break any of these rules sooner than say anything outright barbarous.

**Enough human context** — each proof answers *why this person* for a hire visitor, not a tech slogan that swallows the job. One thesis line earns the scroll; proofs cap at 4–6 on the hire surface (full list on CV).

---

## Honesty law

- Every **production** sentence must trace to **cvdata**, **shipped** walkthroughs, or **golden Q&A** — no fabricated metrics, nodes, or employment scope.
- Systems graph nodes and edges only from evidenced projects (`hire-content` / `lab-operator-system`).
- March–August 2026 slice disclaimer stays when named OSS products appear.
- Oneflow ≠ lab employment; do not inflate IEEE / EEaaS into product claims unless sourced.

---

## Production identity

- **One content body** — `src/lib/hire-content.ts` fed by **`cvdata.landing`**; all hire surfaces import it.
- **Derived layout** — `src/lib/hire-layout-derived.ts`; CSS renders the plan.
- **Stress fixtures** — `/lab/stress/*` inject long must-show strings for LCV; never ship as production facts.
- **No divergent lab prose** — retired A–G skins redirect; `/lab/hire` is lab alias only.

---

## How agents must judge

**Writer ≠ judge.** Author agent may implement; critic agent (or human) runs this checklist before “done”:

1. Read **`TASTE.md`** (this file) + **`DESIGN.md`** (tokens, primary allowance).  
2. **`pnpm verify:doctor`** — Brave + feature map OK.  
3. **`pnpm lcv:probe`** on touched paths — zero `fail: true` on must-show @ all named viewports.  
4. **`pnpm taste:check`** — LCV JSON gate.  
5. **`pnpm test:lab-taste`** (lab) or **`VERIFY_FEATURE=/ pnpm test:e2e:ux`** (home).  
6. Grep fail tells: `Talk instead`, `border-left.*brand-emphasis` on proof lists, `manifesto` sections, coach strings.  
7. **Subtract check:** did we remove Talk/walls before adding chrome?

Do **not** self-approve on pixels alone. Screenshots are evidence attachments; LCV + taste specs are the predicate.

Feature map: `.cursor/skills/verify-devprofile/features/` — never a second route catalog.

---

## Anti-reference

Home `.hire-proof` red-spine + identical evidence blocks = **old chrome** lab must beat, not copy. Screenshots: `ops/devprofile-landing-fresh/` when present.
