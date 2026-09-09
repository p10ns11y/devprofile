---
path: /lab/landing-f
---

# Lab landing F — Timeline

Hiring prototype: compounding timeline, shared evidence panel.

## LCV marks

- `data-lcv=must-show` — operator thesis, contact heading

## Driving

```bash
VERIFY_FEATURE=/lab/landing-f pnpm test:e2e:ux
VERIFY_FEATURE=/lab/landing-f pnpm test:lab-taste
VERIFY_FEATURE=/lab/landing-f pnpm lcv:probe
```
