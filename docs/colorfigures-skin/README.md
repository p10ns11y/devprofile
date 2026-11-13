# Colorfigures research skin

A hire-page visual-language pack (`?vl=colorfigures`) built after the
unbreakable layout invariants in #119. Production `/` is unchanged.

The figure is a desk-top card press in the site's warm orange: turn it all the
way round, load a card, press the lever, and switch on See-through to watch
the platen, die, ink pad, coil spring, cam and guides. It was drawn with the
[Colorfigures](https://april-zhu.com/colorfigures) engine (MIT) by April Zhu,
built on iso-glow and iso-figure by Tolga Cohce. See-through views follow
Anatomy by Ryan (MIT). Licence files are in `third_party/colorfigures/` and
next to the shipped page.


## Accessibility notes

Primary hire buttons on this skin use `--color-brand-emphasis` (`#9a3c2a`) so
white text reaches 6.88:1 (the mid tomato `#cf5038` is 4.32:1). The embed
honours `prefers-reduced-motion`: turntable is hidden, scripted motion
finishes in one step, and pointer-drag orbit on #fig is damped to 20% travel. The
iframe is sandboxed (`allow-scripts` only, unique origin). The MIT notice
stays on the parent page, and the in-frame credit is off when `embed=1`.

## Proof

`pnpm test:unbreakable` runs the same invariant sweep on `/` and on
`/?vl=colorfigures`.

First-screen shots in `before/` are the default hire page. Shots in `after/`
are the Colorfigures skin. Rebuild them with:

```bash
SHOT_ORIGIN=http://localhost:3000/ SHOT_OUT=docs/colorfigures-skin/before node scripts/capture-unbreakable-shots.mjs
SHOT_ORIGIN=http://localhost:3000/?vl=colorfigures SHOT_OUT=docs/colorfigures-skin/after node scripts/capture-unbreakable-shots.mjs
```

To rebuild the figure page:

```bash
bash skins/colorfigures/build.sh
```
