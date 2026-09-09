---
path: /lab/hire
---

# Lab hire — production φ-flow candidate

Same `HireLanding` as `/` with lab notice banner. Retired A–G skins redirect here.

## LCV marks

- `data-lcv=must-show` — thesis blockquote, contact heading
- `data-lcv=preview` — evidence detail rows

## Sub-features

- `hire-hero` — φ-split masthead, View CV primary + Building secondary
- `hire-about` — bento proofs (4–6 from cvdata)
- `hire-systems` — evidenced operator graph section
- `hire-work` — Evidence grid (hairline dividers)
- `hire-contact` — form, no Talk instead

## Driving

```bash
VERIFY_FEATURE=/lab/hire pnpm test:lab-taste
VERIFY_FEATURE=/lab/hire pnpm lcv:probe
```
