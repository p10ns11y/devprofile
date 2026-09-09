---
path: /lab/landing-c
---

# Lab landing C — Gallery

Hiring prototype: spatial hero, proof gallery tiles.

## LCV marks

- `data-lcv=must-show` — thesis, contact heading

## Driving

```bash
VERIFY_FEATURE=/lab/landing-c pnpm test:e2e:ux
VERIFY_FEATURE=/lab/landing-c pnpm test:lab-taste
VERIFY_FEATURE=/lab/landing-c pnpm lcv:probe
```
