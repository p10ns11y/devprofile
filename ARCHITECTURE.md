# Architecture & Technical Documentation

Technical overview of the DevProfile application: structure, routes, tooling, and customization.

## Project structure (Next.js App Router)

```
/
├── .agents/skills/              # Portable agent skills (see AGENTS.md)
├── .editor/                     # Editor profile source (pnpm editor:sync → .vscode)
├── public/
│   ├── cv.pdf                   # Pre-generated CV PDF
│   ├── certificates/            # Certificate files
│   └── images/
├── scripts/
│   ├── generate-pdf.tsx
│   ├── generate-sw-version.mjs
│   ├── playwright-ui-brave.mjs  # E2E UI without bundled Chromium
│   └── sync-editor-profile.mjs
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cv/              # CV data, PDF, QA, download, view
│   │   │   └── certificates/    # Hash verification API
│   │   ├── qa/                  # Profile Q&A page
│   │   ├── certificates/        # Certificate viewer (URL ?id=)
│   │   ├── cv/
│   │   ├── accomplishments/     # Redirects to /#accomplishments
│   │   ├── layout.tsx
│   │   └── page.tsx             # Homepage (client-heavy)
│   ├── components/
│   │   ├── site/                # PageShell, SectionShell, SectionHeading, SiteButton
│   │   ├── ui/                  # shadcn/ui
│   │   ├── profile-qa.tsx       # Q&A UI (client)
│   │   ├── document-viewer.tsx
│   │   ├── verification-hash.tsx
│   │   └── ...
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
| `/certificates` | Certificate grid + PDF overlay (`?id=` selection) |
| `/content-hub*` | **Redirect to `/x`** (no app route — see `docs/content-hub-deferred.md`) |
| `/qa` | Profile Q&A — interview-style questions from CV + curated notes |
| `/accomplishments` | Redirect to `/#accomplishments` |

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

## Vercel feature flags

- **Location:** `src/app/flags.ts` (Vercel Flags Explorer via `.well-known/vercel/flags`)
- Used for optional UI toggles (e.g. documents, skills section)

## Development scripts

Use **pnpm** (see `package.json`). Prefer `sfw pnpm install` when changing dependencies.

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint              # Biome lint only (errors) — correctness, best practices, unused vars/imports
pnpm lint:report       # Biome lint — full output
pnpm lint:fix          # Biome lint --write
pnpm format            # Biome format only (pure editor formatting)
pnpm imports:fix       # Organize imports only (assist)
pnpm type-check
pnpm editor:sync
pnpm generate-pdf
pnpm build-qa-index    # qa-index.json (also runs in every pnpm build)
pnpm qa:eval           # golden retrieval eval — tests/qa/README.md
pnpm test:e2e          # Brave Beta — tests/e2e/README.md
pnpm test:e2e:headed
pnpm test:e2e:ui
```

## API routes

### CV

- `GET /api/cv` — CV data
- `POST /api/cv/generate` — Generate PDF
- `GET /api/cv/download` — Download PDF
- `POST /api/cv/qa` — Profile Q&A: hybrid retrieval (`qa-index.json`), routed generation (`golden-match` \| `template` \| optional `ollama` when `OLLAMA_BASE_URL` is set). Response: `{ answer, details, strategy? }`.
- `GET /api/cv/view` — View CV data
- `GET /api/cv/data` — CV data endpoint

### Certificates

- `GET /api/certificates/[id]/hash` — File hash for verification

## Client React conventions

Interactive UI follows [`.agents/skills/react-client-expert/SKILL.md`](.agents/skills/react-client-expert/SKILL.md): minimal state, deliberate effects, Biome does not enforce `useEffect` dependency arrays.

Phase 1 refactors (verification hash, theme provider, certificate URL selection) are done; Profile Q&A uses `useReducer` in `profile-qa-state.ts`. Later phases tracked in [`.cursor/plans/react_client_roadmap_c18c5c6b.plan.md`](.cursor/plans/react_client_roadmap_c18c5c6b.plan.md).

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
