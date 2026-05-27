
# Peramanathan Sathyamoorthy CV & Portfolio

A modern, full-stack web application showcasing Peramanathan Sathyamoorthy's professional portfolio as a Senior Software Engineer. Built with Next.js 16 App Router, featuring profile Q&A, interactive document viewing, and automated PDF CV generation.

## ✨ Features

- **💬 Profile Q&A**: Ask interview-style questions about experience, grounded in CV data and curated notes
- **📄 Dynamic PDF Generation**: Server-side PDF creation with professional styling
- **👁️ Interactive Document Viewer**: Inline PDF viewing with full browser integration
- **📚 Content Hub**: Dynamic multi-page content management system
- **🎨 Modern UI/UX**: Beautiful shadcn/ui components with responsive design
- **⚡ Performance Optimized**: Fast loading with Next.js App Router and Turbopack
- **♿ Accessibility**: WCAG-oriented patterns with keyboard navigation
- **🔒 Production Ready**: Cross-platform deployment support (Vercel, Netlify, AWS)
- **📱 Mobile-First**: Responsive design optimized for all device sizes

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** — React framework with App Router
- **React 19** — UI library
- **TypeScript** — Type-safe JavaScript

### UI & Components
- **shadcn/ui** — Components on Radix UI
- **Radix UI** — Accessible primitives
- **Lucide React** — Icons
- **Motion** — Animation (`motion/react`)

### AI & Document Processing
- **@react-pdf/renderer** — PDF generation from React
- **react-pdf** — In-browser PDF viewing
- **@huggingface/transformers** — Local embeddings (Profile Q&A retrieval)

### Tooling
- **pnpm** — Package manager (`pnpm-lock.yaml`, workspace supply-chain policy)
- **Biome** — Lint and format (replaces ESLint for this repo)
- **Bun** — Fast runtime for PDF generation scripts
- **Playwright** — E2E tests (system **Brave Beta**, not bundled Chromium)

## 📋 Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 9+ ([Corepack](https://pnpm.io/installation): `corepack enable pnpm`)
- **Brave Beta** (or set `BRAVE_BETA_PATH`) for local E2E — see [tests/e2e/README.md](tests/e2e/README.md)
- **Bun** (optional, for `generate-pdf` script)
- **Git**

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devprofile
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   For stricter supply-chain installs (recommended when changing deps), use [Socket Firewall](https://socket.dev/) or your team's wrapper, e.g. `sfw pnpm install --frozen-lockfile`. Workspace policy lives in `pnpm-workspace.yaml`.

   Optional Profile Q&A Ollama (narrative answers): copy `.env.local.example` → `.env.local`, set `OLLAMA_BASE_URL`, then restart `pnpm dev`. See [tests/qa/README.md](tests/qa/README.md).

3. **Sync editor profile** (optional, Cursor / VS Code)
   ```bash
   pnpm editor:sync
   ```
   Applies `.editor/profile.json` → `.vscode/settings.json`, extension recommendations, and related editor config. Install the **Biome** extension, then reload the window.

4. **Generate initial CV PDF** (optional, first deploy)
   ```bash
   pnpm run generate-pdf
   # or: bun scripts/generate-pdf.tsx
   ```

## 🏃 Development

1. **Start the dev server**
   ```bash
   pnpm dev
   ```
   - App: `http://localhost:3000`
   - Hot reload via Turbopack

2. **Useful routes**
   - Portfolio: `/`
   - CV page: `/cv`
   - Certificates: `/certificates`
   - Content Hub: `/content-hub`
   - Profile Q&A: `/qa`
   - CV PDF: `/cv.pdf`

## 📜 Available Scripts

```bash
# Development
pnpm dev              # next dev --turbopack
pnpm build            # generate PDF + SW version + production build
pnpm start            # production server

# Quality
pnpm lint             # Biome — errors only
pnpm lint:report      # Biome — full diagnostics
pnpm lint:fix         # Biome — auto-fix (errors only)
pnpm format           # Biome format --write
pnpm type-check       # tsc --noEmit

# PDF
pnpm generate-pdf     # bun scripts/generate-pdf.tsx

# Editor profile
pnpm editor:sync      # sync .editor profile → .vscode / Cursor

# E2E (Brave Beta — see tests/e2e/README.md)
pnpm test:e2e         # all projects (desktop + mobile viewport)
pnpm test:e2e:headed  # visible Brave window
pnpm test:e2e:ui      # Playwright UI (opens Brave Beta)
pnpm test:e2e:debug   # inspector + Brave
```

**Dependency / security checks** (after lockfile changes):

```bash
pnpm audit
pnpm install
pnpm type-check && pnpm lint
```

## 🧪 End-to-end tests

E2E uses **Brave Beta** via `playwright.config.ts` / `playwright.brave.ts`, not Playwright-downloaded Chromium.

```bash
export BRAVE_BETA_PATH=/path/to/brave-browser-beta   # optional
pnpm test:e2e
```

Do **not** run `pnpm exec playwright install chromium` for day-to-day work. Remove unused Playwright browsers: `pnpm exec playwright uninstall`.

Details: [tests/e2e/README.md](tests/e2e/README.md)

## 🤖 Agent skills (AI assistants)

Portable skills for Cursor and other coding agents live under [`.agents/skills/`](.agents/skills/). Index: [AGENTS.md](AGENTS.md) and [.agents/README.md](.agents/README.md).

| Skill | Use when |
|-------|----------|
| `fix-dependency-security` | Audit, `sfw`, supply-chain policy |
| `upgrade-packages` | Dependency upgrades and majors |
| `audit-allow-builds` | `allowBuilds` / lifecycle scripts |
| `audit-ide-dependencies` | Editor extension supply-chain |
| `project-editor-profile` | `pnpm editor:sync`, `.editor/profile.json` |
| `react-client-expert` | Client React refactors (minimal state/effects) |

## 🔧 Building for Production

```bash
pnpm build
pnpm start
```

## 🌐 Deployment

Configured for:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- Any Node.js host

### Vercel
1. Push to GitHub
2. Connect the repository
3. Deploy on push (use `pnpm install` / `pnpm build` in project settings)

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Structure and customization
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Branching, Biome, React client guidelines, E2E
- **[CHANGELOG.md](CHANGELOG.md)** — Version history
- **[AGENTS.md](AGENTS.md)** — Agent conventions and Playwright notes
- **[tests/e2e/README.md](tests/e2e/README.md)** — Brave Beta, headed/UI/debug modes

## 📄 License

This project is private and proprietary.

## 📞 Support

For questions or issues:
- Review the code and docs above
- See [AGENTS.md](AGENTS.md) and [.agents/README.md](.agents/README.md) for agent-oriented conventions
- Contact Peramanathan Sathyamoorthy directly

---

**Built with Next.js 16 & React 19**
