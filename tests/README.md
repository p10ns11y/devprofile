# Tests

How this repo proves the site still works. Scripts live in `package.json`. Browser end-to-end (E2E) always uses **system Brave Beta**, never Playwright-downloaded Chromium.

Brave launch, headed mode, and Playwright’s interactive panel: [e2e/README.md](e2e/README.md).  
Route inventory (one markdown file per public path): [verify-devprofile features](../.cursor/skills/verify-devprofile/features/).

## Which command

| Command | What it proves | Browser / host | In default `pnpm test:e2e`? |
|---|---|---|---|
| `pnpm test:unit` | Functions, API routes, golden Q&A shape (Vitest) | Node | no |
| `pnpm test:qa` | Vitest under `src/lib/qa` and `/api/cv/qa` | Node | no |
| `pnpm test:golden` | Retrieval recall on the golden set (`QA_EVAL_STRICT=1`) | Node | no |
| `pnpm test:e2e` | Visitor flows: click, type, nav, phrases | Brave Beta desktop **and** mobile viewport | — |
| `pnpm test:e2e:ux` | User experience (UX) + content on every **feature-map** route | Brave Beta desktop **and** mobile | **yes** (those files also run in `test:e2e`) |
| `pnpm test:e2e:visual` | Full-page pixel baselines vs committed PNGs | Brave Beta **desktop only**, Linux snapshot host | **no** (gated) |
| `pnpm test:e2e:ui` | Playwright **UI runner** (pick tests in a panel) | Opens Brave Beta | n/a |
| `pnpm test:e2e:headed` | Same as `test:e2e`, visible window | Brave Beta | n/a |
| `pnpm verify:doctor` | Brave binary exists, origin reachable, feature map parses | none | n/a |

**`test:e2e:ui` is not `test:e2e:ux`.** The first is a runner. The second is a layer of assertions.

Typical local loop after a site change:

```bash
pnpm verify:doctor
pnpm test:unit
pnpm test:e2e
pnpm test:e2e:visual   # Linux; after layout/copy that should look different
```

Filter one public path (UX / content / visual all honor this):

```bash
VERIFY_FEATURE=/qa pnpm test:e2e:ux
VERIFY_FEATURE=/ pnpm test:e2e:visual
VERIFY_FEATURE='/?cv=view' pnpm test:e2e:ux
```

## Layers

```text
Vitest (unit / Q&A quality)
    │
    ├─ phrase E2E     homepage, Q&A ask, /x dates, Building, course proofs
    │
    ├─ test:e2e:ux    feature map → a11y + content  (desktop + mobile)
    │
    └─ test:e2e:visual feature map → PNG            (desktop, Linux, opt-in)
```

Answer *wording* and retrieval quality stay in Vitest / `pnpm test:golden`. Playwright checks that a visitor can *reach* the desk and that the page is usable — not that a specific sentence came back from Grok.

---

## `pnpm test:e2e` — visitor flows

Runs Playwright’s default projects: `brave-beta` (Desktop Chrome size) and `brave-beta-mobile` (Pixel 5 size). **Ignores** `*.visual.spec.ts`.

These specs own **named interactions** the feature map does not encode:

| Spec | Proves |
|---|---|
| `e2e/homepage.spec.ts` | Hire landing, nav to `/x`, certificates off the primary scroll, sourced evidence copy |
| `e2e/qa.spec.ts` / `qa-reactor.spec.ts` | Ask flow, Evidence panel, looking-up state, API shape |
| `e2e/x.spec.ts` | 8-day window, X search links, brand back home |
| `e2e/global.spec.ts` | Header/footer, 404, mobile menu, keyboard |
| `e2e/building-atlas.spec.ts` | White-hole gloss |
| `e2e/course-proofs.spec.ts` | Cilium / LangChain proof links |
| `e2e/a11y/` + `e2e/content/` | Same UX / content loop as `test:e2e:ux` |

Phrase-level hiring copy stays here. Do not duplicate it into the feature markdown.

---

## `pnpm test:e2e:ux` — usable page, not pixels

```bash
playwright test tests/e2e/a11y tests/e2e/content --project=brave-beta --project=brave-beta-mobile
```

Walks **every** file in `.cursor/skills/verify-devprofile/features/` (except `README.md`). Each file’s `path:` frontmatter is one test. Do **not** add a second TypeScript route catalog.

Two specs, same map:

| Spec | Helper | Asserts |
|---|---|---|
| `e2e/a11y/pages.a11y.spec.ts` | `assertUx` | One visible `h1` (CV dialog title on `/?cv=view`); heading contrast ≥ 4.5:1; no horizontal overflow; desktop **Primary** nav + Tab focus; mobile hamburger → **Mobile** nav |
| `e2e/content/pages.content.spec.ts` | `assertContent` | Document title (not 404); `meta description`; `main`; no “lorem ipsum” / `TODO` |

Both hide Vercel / Next overlay chrome so it cannot steal clicks.

**When it fails:** a route lost its heading, overflowed, or shipping placeholder copy. Fix the page. Do not skip.

**When it is the wrong tool:** a button label changed (“Quest” → “Ask question”). That belongs in `qa.spec.ts`, not here.

---

## `pnpm test:e2e:visual` — pixels

```bash
E2E_VISUAL=1 playwright test --project=brave-beta-visual
```

Gated: without `E2E_VISUAL=1` the visual Playwright project is not registered, so default `pnpm test:e2e` never compares PNGs.

| Rule | Why |
|---|---|
| Desktop only (`brave-beta-visual`) | One committed baseline per route, not a mobile matrix |
| Linux host (`E2E_VISUAL_FORCE=1` to mint elsewhere) | Font / subpixel drift across machines |
| Full-page screenshot, `maxDiffPixelRatio` 0.02 | Layout and type, not a cropped hero |
| Reduced motion + reveal below-fold Motion | Avoid blank `opacity: 0` sections |
| `[data-visual-live]` is **masked** (magenta in the PNG) | GitHub live host, `/x` date stack — time-varying paint |
| `/qa` is **skipped** | Answers are session-dynamic; no pixel baseline |

Committed files: `e2e/visual/pages.visual.spec.ts-snapshots/*-brave-beta-visual-linux.png` (`home`, `cv`, `certificates`, `focus`, `profile`, `x`). Magenta in a baseline is the live mask, not a missing image. GitRoll CURISM is a **static** asset — do not mark it `data-visual-live`.

### Refreshing baselines (agents)

Only after an **intentional** layout or copy change, on this Linux machine. Full narrative: the rule [e2e-visual-snapshots.mdc](../.agents/rules/e2e-visual-snapshots.mdc).

```bash
# 1) See what failed (do not update yet)
pnpm test:e2e:visual
# Inspect test-results/**/*-actual.png vs tests/e2e/visual/pages.visual.spec.ts-snapshots/

# 2) If the new page is correct, mint only the failing path
VERIFY_FEATURE=/certificates E2E_VISUAL=1 pnpm exec playwright test --project=brave-beta-visual --update-snapshots

# Several routes moved together:
E2E_VISUAL=1 pnpm exec playwright test --project=brave-beta-visual --update-snapshots

# 3) Prove the new PNGs match (no --update-snapshots)
pnpm test:e2e:visual
```

Commit the PNGs with the layout change. A height jump (home shorter because certificates left the landing; Earned taller because of quote + courses) is expected after that class of change — update, do not revert the page to match an old PNG.

Off Linux: `E2E_VISUAL_FORCE=1` only if you must mint; prefer the Linux snapshot host.

### Typical visual failure

| Symptom | Meaning |
|---|---|
| Expected 7417px, received 6254px | Page height changed — usually real layout |
| ~2%+ pixels differ, same size | Spacing, type, or color drift |
| Magenta block over art | Something was marked `data-visual-live` that should not be |

Failure dumps: `test-results/` (gitignored). Agent captures: `artifacts/verify-devprofile/` (gitignored). Snapshots **are** committed.

---

## Feature map (routes)

| `path:` | UX / content | Visual PNG |
|---|---|---|
| `/` | yes | `home.png` |
| `/?cv=view` | dialog, not the home `h1` | `cv.png` (home under the dialog) |
| `/certificates` | list, not an open overlay | `certificates.png` |
| `/focus` | yes | `focus.png` |
| `/profile` | cover slide | `profile.png` |
| `/x` | yes | `x.png` (dates masked) |
| `/qa` | yes | **none** |

Building atlas is phrase E2E only — it is not a feature-map row.

Add a public route: new `features/<name>.md` with `path:`, then UX/content pick it up automatically. Add a PNG only if the page is visually stable.

---

## Unit and golden (not Playwright)

| Command | Scope |
|---|---|
| `pnpm test:unit` | Vitest, including certificates, CV layout, Q&A pipeline |
| `pnpm test:certificates` | Certificate registry + verify API |
| `pnpm test:qa` | Q&A library + `POST /api/cv/qa` |
| `pnpm qa:eval` / `pnpm test:golden` | Retrieval metrics — [qa/README.md](qa/README.md) |

---

## CI / agents

Install Brave Beta on the runner (or set `BRAVE_BETA_PATH`). Do not `playwright install chromium` for these tests.

Visitor-drive skill: [verify-devprofile](../.cursor/skills/verify-devprofile/SKILL.md).
