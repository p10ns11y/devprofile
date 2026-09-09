---
path: /lab/landing-d
---

# Lab landing D — Map

Hiring prototype: operator systems constellation map, proof orbit, shared evidence.

## LCV marks

- `data-lcv=must-show` — operator thesis, contact heading
- `data-lcv=preview` — SVG map, evidence rows

## Driving

```bash
VERIFY_FEATURE=/lab/landing-d pnpm test:e2e:ux
VERIFY_FEATURE=/lab/landing-d pnpm test:lab-taste
VERIFY_FEATURE=/lab/landing-d pnpm lcv:probe
```
