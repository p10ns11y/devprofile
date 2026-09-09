---
path: /
---

# Home

Hiring landing (φ-flow): name from **cvdata**, distilled thesis, auto-fit proofs, systems graph, evidence column pack, contact.

## Sub-features

- `home-hero` — name, role, `Available now · Stockholm`, one-breath thesis. One quiet primary CTA (`View CV`) plus text secondaries (`Building`, `Q&A`, `Articles`). No Talk-as-button CTAs.
- `home-about` — “What you are hiring”: six proof cards (auto-fit dense; no redundant section lead when empty).
- `home-systems` — evidenced operator graph (`#systems`); stacked pack by default.
- `home-evidence` — Evidence CSS column pack; family eyebrows; interactives center→right.
- `home-contact` — form + Direct channels links only (no Talk channel, no aside CTA row).

## Driving

```bash
VERIFY_FEATURE=/ pnpm test:lab-taste
VERIFY_FEATURE=/ pnpm lcv:probe
pnpm layout:phi-check
```

## Gotchas

- Header sits inside layout `<main>`, so there is no `role=banner`.
- `#projects` and `#academic` are not mounted on this page.
- Layout authority: `deriveHireLayout()` + CSS — not JSX span classes.
