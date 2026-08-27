---
version: 1
slug: "src-app-focus-page-tsx"
primary_target: "src/app/focus/page.tsx"
related_targets:
  [
    "src/styles/focus.css",
    "src/components/focus/focus-essay-card.tsx",
    "src/data/focus-essays.ts",
    "src/app/focus/eeaas-to-agents/page.tsx",
    "src/components/header.tsx",
    "src/components/footer.tsx",
  ]
---

# /focus

- **Mode:** Browse → Read
- **Audience:** Technical readers (hiring reviewers, collaborators) who want a map of Focus essays before committing to one sitting
- **Job:** Pick an essay from article cards; nested routes hold the longform (`/focus/eeaas-to-agents`, `/focus/memory-issue`)
- **Proof:** Catalog diagrams as card art; featured card is the 2016→2026 thesis
- **Direction:** Essay index inside existing Focus tokens (Instrument display, DM Sans, brand warm neutrals); whole-card links, no nested controls
- **Memorable moment:** Featured EEaaS→agents card beside pulse-memory; series crumbs on nested essays
- **Unresolved:** Additional Focus essays can append to `FOCUS_ESSAYS` without a new layout
