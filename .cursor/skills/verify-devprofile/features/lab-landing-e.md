---
path: /lab/landing-e
---

# Lab landing E — Systems

Hiring prototype: operator thesis + compound proof cards (no manifesto wall).

## LCV marks

- `data-lcv=must-show` — operator thesis, contact heading

## Driving

```bash
VERIFY_FEATURE=/lab/landing-e pnpm test:e2e:ux
VERIFY_FEATURE=/lab/landing-e pnpm test:lab-taste
VERIFY_FEATURE=/lab/landing-e pnpm lcv:probe
```
