---
path: /lab/landing-b
---

# Lab landing B — Bento

Hiring prototype: centered hero card, proof bento board.

## LCV marks

- `data-lcv=must-show` — thesis, contact heading

## Driving

```bash
VERIFY_FEATURE=/lab/landing-b pnpm test:e2e:ux
VERIFY_FEATURE=/lab/landing-b pnpm test:lab-taste
VERIFY_FEATURE=/lab/landing-b pnpm lcv:probe
```
