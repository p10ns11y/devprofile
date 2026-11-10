# Unbreakable layout sweep

Measured 10 Nov 2026, 00:12 Europe/Stockholm (CET) against this branch
(`unbreakable-hire-layout`) via the local preview. Supporting JSON:
[`sweep-latest.json`](./sweep-latest.json).

The production baseline below was taken on 9 Nov 2026 against
[captain.kingsparrow.space](https://captain.kingsparrow.space/) with the
must-show-only detector.

## Before / after

| Run | Samples | Pass | Fail | Notes |
| --- | ---: | ---: | ---: | --- |
| Production baseline (9 Nov) | 691 | 685 | 6 | All six were `text-overflow-must-show` on `#hire-contact-heading` under the 400×W stress |
| This slice, same 691-point grid | 691 | 691 | 0 | Detector also flags header-brand truncate/overflow, email-channel overflow, and atlas pan |
| German compound stress | 6 | 6 | 0 | Same six viewports as the 400×W stress |
| Finnish compound stress | 6 | 6 | 0 | Same six viewports |
| **This slice, all samples** | **703** | **703** | **0** | 691 + 12 locale |

The 691-point grid is unchanged: named LCV 375×812, 768×1024, 1280×720 and
their flips; 46 unique device/orientation pairs; a width lattice every 40px
from 280 to 3840 at heights 320, 375, 430, 568, 720, 812, 1080 (unique’d
against the named and device sets → 627 grid samples); zoom 200% at six
critical sizes; and the six 400-character `W` stresses.

| Bucket | n | Fail before | Fail after |
| --- | ---: | ---: | ---: |
| lcv-named | 3 | 0 | 0 |
| lcv-named-flipped | 3 | 0 | 0 |
| device | 46 | 0 | 0 |
| grid | 627 | 0 | 0 |
| zoom200 | 6 | 0 (must-show only) | 0 (extended detector) |
| long-text (400×W) | 6 | 6 | 0 |
| locale-de | 6 | — | 0 |
| locale-fi | 6 | — | 0 |

The production 685/691 pass hid three faults the must-show detector did not
cover, which this slice fixes and now measures:

1. **Header brand at 280px.** `truncate` plus `max-w-[45vw]` ellipsized
   “Peramanathan S.” Next to the menu button there is enough room; the brand
   no longer clips, and it can wrap with `overflow-wrap: anywhere` if a
   longer label ships later.
2. **Email channel at 280px.** `sathyam.peram@gmail.com` overflowed because
   the channel row’s flex min-content kept the unbroken address wider than
   the aside. The flex chain now shrinks, and a `<wbr>` before `@` prefers
   `sathyam.peram` / `@gmail.com` over a mid-token break.
3. **Systems atlas below about 812px.** Below 768px the map forced a 980px
   SVG and panned sideways. Viewports from 280 through 812px (`50.75rem`)
   now get a stacked editorial layout: cluster bands, wrapping project
   names, area docks, a funnel into “one priority list”, then the portal.
   Above 812px the original SVG remains (scaled, not panned). Phone
   landscape (844) and the inner fold (884) keep that map.

A first slice had already stopped the contact-heading 400×W overflow by
marking the contact section, but the full 691-point grid had not been
re-run after that change.

## Hero math: proven vs sampled

`src/lib/hire-hero-math.ts` is `L = f(content, θ, w)` (height is only used
for the short-landscape split). Text runs are measured once; wrap
thresholds, column widths and must-show boxes are then arithmetic.

**Proven (interval).** For every width in `[280, 3840]`, the name and
thesis must-show marks stay inside the viewport horizontally under this
CSS model:

- marks are block-level in columns that tile the content width
- `contentWidth(w) = min(w, 80rem) - 2 * clamp(1rem, 4vw, 1.5rem)`
- `overflow-wrap: anywhere` and `min-width: 0`, so intrinsic min-width is 0
- when split, name + gap + thesis = content width
- rem = 16px

Naive interval arithmetic on the whole domain is too loose (the `min(w,
80rem)` corner at 1280px). After splitting there, slack is the inset:
`[16, 24]` px on `[280, 1280]` and at least 24px on `[1280, 3840]`. That
is a proof of the model, not of Chromium, subpixel rounding, or zoom.

**Sampled.** Column `x` / `width` and greedy line counts versus the live
DOM on widths 280–1920 every 40px at height 812, plus 812×375, 844×390,
1280×720 and 720×1280. The Playwright check allows 3px and ±1 line. On
this machine the geometry matched to well under a pixel and line counts
matched exactly, even though the DOM uses `text-wrap: balance` on the
name and `pretty` on the thesis.

**Not proven.** Vertical clip, overlap, or reading order; header brand,
email channel, and the systems atlas (they sit outside `f(hero)`);
`text-wrap: balance` / `pretty` versus greedy wrap in general; a root
font-size other than 16px; the browser’s own zoom implementation.

Unit coverage lives in `src/lib/hire-hero-math.test.ts`. The DOM match is
the third test in `tests/e2e/unbreakable-layout.spec.ts`.

## Locale stress

The three must-show marks were rewritten in place, then restored:

- German: `Wolf-Friedrich Weißkirchen-Großmann`; thesis with
  `Softwareentwicklungszusammenarbeit` and `Demonstrationsbeispiel`;
  heading `Kontaktaufnahme und Zusammenarbeitsschnittstellen`.
- Finnish: the live name kept (already two long tokens); thesis with
  `ohjelmistokehitysyhteistyömahdollisuus`; heading
  `Yhteydenottolomakevaihtoehdot`.

Same viewports as the 400×W stress: 280×653, 375×812, 812×375, 1280×720,
653×280, 3840×2160. Twelve samples, twelve passes.

## Taste pass

Tall portraits (`orientation: portrait` and `min-height: 50rem`) start the
hero on the φ rhythm instead of vertically centering it in leftover `dvh`.
Tablet and foldable portraits no longer float in a large empty band; the
hero is still `min-height: 100dvh`, so the desktop `#about`-below-fold
check at 1280×720 is unchanged. After screenshots were refreshed:

- hero: `docs/unbreakable-layout/after/{phone-portrait,phone-landscape,foldable,tablet,ultrawide}.png`
- systems: the matching `*-systems.png` files (stacked map through 812px;
  SVG map above that)

## How to rerun

```bash
pnpm test:unbreakable
pnpm sweep:unbreakable
pnpm test:unit src/lib/hire-hero-math.test.ts
```

`pnpm sweep:unbreakable` writes `docs/unbreakable-layout/sweep-latest.json`.
Override the origin with `SWEEP_ORIGIN`.

## Still open

- Interval proofs do not yet cover the header, email channel, or atlas.
- A machine-checked proof of `g(L) ≤ 0` over every pixel, splitting on
  every layout discontinuity, is still research.
- The wide SVG above 812px is a scaled drawing of the same scene, not a
  separate wide-only composition.
- This PR is not merged.
