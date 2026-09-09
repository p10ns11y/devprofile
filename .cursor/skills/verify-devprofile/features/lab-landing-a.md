---
path: /lab/landing-a
redirect: /lab/hire
---

# Lab landing A — Editorial (retired)

**Retired.** Redirects to [`/lab/hire`](./lab-hire.md) — production φ-flow landing.

## LCV marks

- `data-lcv=must-show` — thesis blockquote, contact heading
- `data-lcv=preview` — evidence detail rows (shared `LabEvidenceSection`)

## Sub-features

- `lab-a-hero` — name, thesis, View CV primary + Building secondary
- `lab-a-about` — four terse proofs (not six)
- `lab-a-work` — Evidence grid
- `lab-a-contact` — form, no Talk instead

## Driving

```bash
VERIFY_FEATURE=/lab/landing-a pnpm test:e2e:ux
VERIFY_FEATURE=/lab/landing-a pnpm test:lab-taste
VERIFY_FEATURE=/lab/landing-a pnpm lcv:probe
```
