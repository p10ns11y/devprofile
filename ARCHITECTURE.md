# Architecture & Technical Documentation

Technical overview of the DevProfile application: structure, routes, tooling, and customization.

## Project structure (Next.js App Router)

```
/
├── .agents/skills/              # Portable agent skills (see AGENTS.md)
├── .ide/                        # IDE profile source (pnpm ide:sync → .vscode)
├── public/
│   ├── cv.pdf                   # Pre-generated CV PDF
│   ├── certificates/            # Certificate files
│   └── images/
├── scripts/
│   ├── generate-pdf.tsx
│   ├── generate-sw-version.mjs
│   ├── playwright-ui-brave.mjs  # E2E UI without bundled Chromium
│   └── sync-ide-profile.mjs
├── src/
│   ├── app/
│   │   ├── actions.ts           # Server actions
│   │   ├── api/
│   │   │   ├── cv/              # CV data, PDF, QA, download, view
│   │   │   └── certificates/    # Hash verification API
│   │   ├── ama/                 # AI AMA chat
│   │   ├── certificates/        # Certificate viewer (URL ?id=)
│   │   ├── content-hub/         # Dynamic content pages
│   │   ├── cv/
│   │   ├── accomplishments/
│   │   ├── quick-cv-actions/
│   │   ├── layout.tsx
│   │   └── page.tsx             # Homepage (client-heavy)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui
│   │   ├── content-hub/
│   │   ├── ai-chat.tsx
│   │   ├── document-viewer.tsx
│   │   ├── verification-hash.tsx
│   │   └── ...
│   ├── config/feature-flags.ts
│   ├── data/cvdata.json
│   ├── data/documents-data.ts
│   ├── hooks/
│   ├── lib/                     # e.g. certificate-hash.ts
│   ├── types/
│   └── styles/globals.css
├── tests/e2e/                   # Playwright (Brave Beta)
├── biome.json                   # Lint + format
├── playwright.config.ts
├── playwright.brave.ts
├── pnpm-workspace.yaml          # Supply-chain policy + overrides
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## App routes

| Path | Purpose |
|------|---------|
| `/` | Portfolio homepage |
| `/cv` | CV page |
| `/cv/view` | CV view variant |
| `/certificates` | Document viewer (certificates; `?id=` selection) |
| `/content-hub` | Content hub index |
| `/content-hub/[page]` | Content hub pages |
| `/ama` | AI assistant |
| `/accomplishments` | Accomplishments |
| `/quick-cv-actions` | Quick CV actions |

## Customization

### CV data

1. Edit `src/data/cvdata.json`
2. Adjust components in `src/components/` as needed
3. Regenerate PDF: `pnpm run generate-pdf`

### Certificates / documents

1. Add metadata in `src/data/documents-data.ts`
2. Place files under `public/`
3. Viewer: `src/components/document-viewer.tsx` + `src/app/certificates/`

### Styling

- Global tokens: `src/styles/globals.css`
- Tailwind: `tailwind.config.ts` (v4 + PostCSS)
- Theme: `src/components/theme-provider.tsx` (`light` / `dim`)

## Feature flags

- **Location:** `src/config/feature-flags.ts`
- Toggles for in-development features (e.g. AMA) and user-facing disclaimers

## Development scripts

Use **pnpm** (see `package.json`). Prefer `sfw pnpm install` when changing dependencies.

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint              # Biome — errors only
pnpm lint:report       # Biome — full output
pnpm lint:fix
pnpm format
pnpm type-check
pnpm ide:sync
pnpm generate-pdf
pnpm test:e2e          # Brave Beta — tests/e2e/README.md
pnpm test:e2e:headed
pnpm test:e2e:ui
```

## API routes

### CV

- `GET /api/cv` — CV data
- `POST /api/cv/generate` — Generate PDF
- `GET /api/cv/download` — Download PDF
- `POST /api/cv/qa` — AI Q&A
- `GET /api/cv/view` — View CV data
- `GET /api/cv/data` — CV data endpoint

### Certificates

- `GET /api/certificates/[id]/hash` — File hash for verification

## Client React conventions

Interactive UI follows [`.agents/skills/react-client-expert/SKILL.md`](.agents/skills/react-client-expert/SKILL.md): minimal state, deliberate effects, Biome does not enforce `useEffect` dependency arrays.

Phase 1 refactors (verification hash, theme provider, certificate URL selection, ai-chat scroll/streaming) are done; later phases tracked in [`.cursor/plans/react_client_roadmap_c18c5c6b.plan.md`](.cursor/plans/react_client_roadmap_c18c5c6b.plan.md).

## E2E testing

- **Browser:** system Brave Beta (`playwright.brave.ts`), not Playwright-downloaded Chromium
- **Docs:** [tests/e2e/README.md](tests/e2e/README.md), [AGENTS.md](AGENTS.md)

## Adding features

### New page section

1. Component in `src/components/` (kebab-case)
2. Wire into `src/app/.../page.tsx` or homepage
3. Update `src/components/header.tsx` navigation
4. Add types under `src/types/` if needed

### New document type

1. `DocumentItem` in `src/types/documents.ts`
2. Rendering in `document-viewer.tsx`
3. Metadata in `documents-data.ts`

### New API route

1. Route under `src/app/api/`
2. Optional server action in `src/app/actions.ts`
3. Types + error handling

## Deployment

- **Platforms:** Vercel (recommended), Netlify, AWS Amplify, any Node 18+ host
- **Install / build:** `pnpm install`, `pnpm build`
- **Env:** Cross-platform URLs; no required env vars for basic operation

## Related documentation

- [README.md](README.md) — Setup and scripts
- [CONTRIBUTING.md](CONTRIBUTING.md) — Branching and quality bar
- [CHANGELOG.md](CHANGELOG.md) — Release history
- [AGENTS.md](AGENTS.md) — Agent skills and conventions
