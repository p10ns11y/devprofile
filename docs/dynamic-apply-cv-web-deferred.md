# Dynamic apply CV on the portfolio site — deferred

**Status:** Paused (2026-08-04). Do not wire `/?cv=view` (or `/api/cv/view`) to pack overlays until **clean data storage** exists.

## Why pause

Today’s apply path is intentional but **split-brain**:

| Surface | Data |
|---------|------|
| Portfolio `/?cv=view` + `/api/cv/view` | Master only — `src/data/cvdata.json` |
| Apply PDFs | Master + pack `cv-overlay.json` → `kanithanj.cv generate` (collab-finder) |
| Packs | Local symlink `application_packs/` (gitignored) — not on Vercel |

Making the public site “dynamic” before a single syncable store means duplicating overlays (or `out/apply` artifacts) into the deploy tree, plus ongoing **sync and maintenance overhead**. That cost dominates the small UI plumbing (`applyCvOverlay` already exists).

**Gate to resume:** one clear store for pack/overlay (or published apply CV payloads) that both collab-finder export and the portfolio can read without hand-copy or dual writes.

## What stays true until then

- Master CV on the site stays the durable public view.
- Job-tailored CVs stay offline: pack → overlay → `out/apply/…pdf`.
- Do not invent a second publish path “just for preview.”

## Possible future integrations (when storage is clean)

Rough order — pick one storage story first, then wire surfaces.

1. **Shared pack store (preferred)**  
   Single location for `manifest.json` + `cv-overlay.json` (or equivalent) that collab-finder writes and devprofile reads (local path, object storage, or small private API). Portfolio resolves `?pack=<slug>` → merge → web + PDF.

2. **Publish-on-generate**  
   `generate-apply-cv` writes a **versioned overlay payload** (or static JSON under a controlled prefix) as part of apply export — portfolio only reads published artifacts, never the live packs symlink. Still needs one ownership rule for what gets published.

3. **URL-scoped preview (auth later)**  
   `/?cv=view&pack=<slug>` and `/api/cv/view?pack=<slug>` reusing `applyCvOverlay` + optional `featuredKeys` on `CvSheet` / `CVDocument`. Only after (1) or (2); add token/obscurity if links must stay private.

4. **collab-finder deep link**  
   “Open tailored CV” from a pack UI → portfolio URL with pack id; same loader as (3).

5. **Optional:** serve prebuilt `out/apply/<slug>/….pdf` for download while web view stays overlay-merged HTML — only if PDF bytes are also in the clean store (avoid dual sources of truth).

## Non-goals (while paused)

- Syncing gitignored packs into Vercel “somehow.”
- Mutating master `cvdata.json` per job.
- Public job-tailored CV URLs without an auth/storage decision.

## Related

- Apply workflow: [apply-cv-from-packs.md](./apply-cv-from-packs.md)
- Overlay merge: `src/lib/cv-overlay.ts`
- Apply CLI: `kanithanj.cv` (collab-finder). Leftover writer here: `scripts/generate-apply-cv.tsx`
