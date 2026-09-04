---
path: /projects
---

# Projects walkthroughs

Product walkthrough gallery and per-slug detail pages under `/projects`.

## Index (`/projects`)

- Gallery lists every `PROJECT_WALKTHROUGHS` entry with outcomes, stack chips, and link to detail.
- Each card links to `/projects/[slug]`.

## Detail (`/projects/[slug]`)

- Hero: eyebrow, title, lede, audience, outcomes, surfaces, GitHub / live / npm CTAs.
- Product band: product section blocks (callouts, bullets, paragraphs).
- Tech band: **architecture Mermaid diagram first** (above stack chips and prose), then stack chips, then architecture / components / data-flow / tradeoffs / testing-ops sections.
- Diagram is the leading block in the architecture section data; the slug page hoists it above chips and strips it from section body copy so prose never precedes the diagram.

## Observable contract

- Every walkthrough with a tech band has `architecture` section `blocks[0].type === "mermaid"`.
- `getArchitectureDiagram(project)` must be defined for all four slugs: `collab-finder`, `thepulimaangani`, `adaptate`, `agent-prompt-tuning-lab`.
- Vitest: `src/data/project-walkthroughs.test.ts` asserts diagram-first data shape.
