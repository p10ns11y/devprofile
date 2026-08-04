# Apply CVs from collab-finder packs

Frictionless path: collab-finder packs stay in app data; devprofile **symlinks** them (gitignored) and renders portfolio-styled PDFs into a dedicated output folder. Master `cvdata.json` is never written by this path.

## Output filename rule (always)

```text
{name}-{role}-{id}.pdf
```

Example:

```text
peramanathan-sathyamoorthy-exceptional-software-engineer-4956028007.pdf
```

| Segment | Source |
|---------|--------|
| **name** | Master `cvdata.json` → `name` |
| **role** | Pack `manifest.json` → `title` |
| **id** | `manifest.job_id` → else Greenhouse id from `source_url` → else `opportunity_id` |

Implemented in `src/lib/apply-cv-filename.ts` + `scripts/generate-apply-cv.tsx`.

## Layout

Pack folders use a **meaningful slug** (not bare `opp_17`):

```
{company}-{title}-{YYYY-MM-DD}
```

Example: `xai-exceptional-software-engineer-2026-07-17`

```
~/.local/share/collab-finder/application_packs/
  xai-exceptional-software-engineer-2026-07-17/
    manifest.json            # slug, company, title, date, job_id, source_url, opportunity_id
    cv-overlay.json
    submit/
      {name}-{role}-{id}.pdf

devprofile/
  application_packs → symlink (gitignored)
  out/apply/{name}-{role}-{id}.pdf          # easy upload
  out/apply/<pack-slug>/{name}-{role}-{id}.pdf
  out/apply/<pack-slug>/cv.pdf              # alias
  out/apply/<pack-slug>/meta.json
```

## Generate

```bash
pnpm link-application-packs   # once
pnpm generate-apply-cv xai-exceptional-software-engineer-2026-07-17
# also: 17 | opp_17
```

Does **not** touch `public/cv.pdf` or `src/data/cvdata.json`.

## Overlay schema (`cv-overlay.json`)

| Field | Purpose |
|-------|---------|
| `featured_keys` | Project keys shown on the PDF |
| `projects_upsert` | Merge/append projects by `key` |
| `overrides` | Shallow root fields (`profile`, `latest_proffessional_role`, etc.) |

**Source:** collab-finder **Export pack / Generate apply CV** auto-builds `cv-overlay.json` from prep (`cv_suggestions`, exceptional work, project mentions). Without it, PDFs look identical (master CV). Older packs: `generate-apply-cv` synthesizes an overlay from `cv-suggestions.md` when the JSON is missing and writes it into the pack.

## Portfolio site PDF

```bash
pnpm generate-pdf   # → public/cv.pdf from master only
```

The live site (`/?cv=view`, `/api/cv/view`) always uses **master** `cvdata.json`. Wiring pack overlays into that surface is **deferred** until clean shared storage exists — see [dynamic-apply-cv-web-deferred.md](./dynamic-apply-cv-web-deferred.md).
