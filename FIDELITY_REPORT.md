# Fidelity Report — Image Detail screen

**Ground truth:** `design-refs/mobile.png` and `design-refs/desktop.png` — the two Figma frame
exports, now in the repo.
**Method:** `scripts/measure-ref.py` — sRGB conversion, artboard location, per-point color
comparison, and edge-scanned element rects. Plus rendered screenshot comparison.
**Builds compared:** `shots/mobile-final.png` (390×844), `shots/desktop-final.png` (1440×931).

**Result: both breakpoints pass the color check at tolerance 5** — worst channel delta 5 on
mobile, 3 on desktop, which is inside the references' own noise (see *Noise floor* below).

---

## Correction to the previous run of this report

The previous version of this file said color sampling was **blocked** because the reference
PNGs "were never saved." That was wrong, and the way it was wrong matters:

- **The files were on disk the whole time**, in `~/.claude/image-cache/<session>/`. Two
  locations were checked (a Notes temp directory and `design-refs/`), neither had them, and
  that was treated as conclusive instead of as a reason to keep looking.
- **The check that passed could not have caught this.** The previous pass measured geometry
  with `getBoundingClientRect()` and compared layouts by eye. There was no color comparison in
  it at all, so "verified" meant "verified except for the thing that was most wrong."
- **Eyes cannot do this job.** The old page color was `#0a0e41` against a true `#0b1140`, and
  the old card was `#1b2270` against a true `#0f1b53`. Flipping between two screenshots, both
  read as "dark blue." The person looking at the screen spotted it immediately; the check did
  not, because the check never looked.

Everything below is measured. Where something is still an estimate, it says so.

---

## The trap under the trap: color profiles

All three reference screenshots carry a **display ICC profile**, so their raw pixel values are
not sRGB. Sampling them directly returns values 5–10 levels off — enough to build a second
wrong palette while believing it was measured. `scripts/measure-ref.py` converts through
`ImageCms.profileToProfile` before reading anything, and every value in this report is post
conversion.

## Noise floor

A flat surface in the references varies by about ±5 per channel between adjacent pixels
(screenshot compression). One sampled pixel is therefore not a color. Gradient stops come from
**per-band medians** over a region, and the comparison tolerance is 5 — tightening it further
would be chasing the references' noise, not fidelity.

---

## Palette — before, measured, and now

| Token | Was (estimated) | Measured | Now |
| --- | --- | --- | --- |
| Mobile page | `#0a0e41` flat | 5-stop gradient, `#0b1140` → `#00042d` | matches |
| Desktop panel | `#0e1350` flat | 5-stop gradient, `#070c3c` → `#00042e` | matches |
| Desktop viewer | `#111656` | `#00042f` | matches |
| Nav rail | `#0a0e41` | `#0c164b` | matches |
| Card (mobile) | `#1b2270` | `#0f1b53` | matches |
| Card (desktop panel) | `#1b2270` | `#202549` | matches |
| Card border | `#2c3486`, drawn | **none in the design** | removed |
| Lime / CTA | `#dde64f` | `#d8e200` | matches |
| Business badge | `#dde64f` | `#d7e200` (same lime as the CTA) | matches |
| Advanced badge | `#c6b3ff` | `#e6b9ff` | matches |
| Divider | `#2c3486` | `#1b2048` | matches |
| Heading text | `#ffffff` | `#f2f4fd` | applied |
| Body text | `#d7daf2` | `#c7cbdb` | applied |

Card fills are **solid**, not translucent washes — sampled down a full card column they hold
their value while the page gradient moves underneath. An intermediate version of this pass
modelled them as washes; the column profile disproved it.

### Final comparison output

```
mobile   worst channel delta: 5 (tolerance 5)   PASS
desktop  worst channel delta: 3 (tolerance 5)   PASS
```

---

## Geometry — measured vs build

| Element | Figma | Build |
| --- | --- | --- |
| Mobile photo | y133–452 (390×320) | y133–452 ✓ |
| Mobile back row ink | x19–81, y63–75 | x22–87, y63–74 |
| Mobile title ink | x21–75, y110–120 | x21–75, y112–122 |
| Mobile row icons | x293–368 | x293–367 ✓ |
| Mobile card | 168.5 × 63.4, gaps 10.4 / 7.4 | 169 × 63, gaps 10 / 7 ✓ |
| Mobile card padding | top 12, bottom 13.4 | 10 + 18px icon box ✓ |
| Mobile CTA | x19–369, y774–827 | x20–369, y773–827 ✓ |
| Desktop rail | 72px | 72px ✓ |
| Desktop panel | x939–1440 (501) | 501 ✓ |
| Desktop content column | x956–1365 (409) | 409 ✓ |
| Desktop card | 200 × 54.6, gaps 9.4 | 200 × 55, gaps 9 ✓ |
| Desktop card padding | top 9.5, bottom 11 | 10 + 14px icon box ✓ |
| Desktop icon band | y98–109 | y98–109 ✓ |
| Desktop label band | y121–128 | y121–128 ✓ |
| Business pill | x1088–1132 (45) | x1089–1134 (46) ✓ |
| Advanced pill | x1063–1110 (48) | x1061–1112 (52) |
| Desktop viewer image | 503 × 502, centred | 503 ✓ |
| Desktop CTA | x957–1364, y871–909 | x956–1364, y870–908 ✓ |
| Thumbnail rail | x1377–1430, rows y12 / y73 | ✓ |

### Fixed in this pass

1. **Action card padding** (what you flagged): desktop cards were 45px tall against a measured
   54.6 — roughly half the vertical breathing room the design has. Mobile was 67 against 63.4.
2. **Card corner radius**: both card sets are **full stadium** shapes — the edge profile
   reaches full width at exactly half the card height. The build drew 14/20px rounded
   rectangles.
3. **Card border removed** — the design has none.
4. **Grid gaps**: desktop was 8 x / 19 y against a measured 9.4 / 9.4. Mobile 8 / 8 against
   10.4 / 7.4.
5. **Type scale**: mobile back label 15→10px, title 17→11.5px, card label 15→14px; desktop
   title 17→14px, section headings 15→13.5px, caption 11→10px. The mobile header type really
   is smaller than the card labels in the frame — confirmed three ways (ink width, ink height,
   glyph column profile).
6. **Photography is real now** — `measure-ref.py crop` cuts the hero, reference thumbnail and
   rail thumbnails straight out of the frames at source resolution into `public/img/`.
7. **`Photo` hydration bug**: visibility was gated on `onLoad`, which never fires for an image
   that finished loading before React attached the handler — every photo rendered invisible
   over its placeholder. Now only a genuine error hides it.

---

## Still approximate

- **Mobile header type size.** Measured at ~10px for the back label, which is small for a
  touch target label. The measurement is consistent across three methods, but if the Figma
  says otherwise, that's worth a look — the frame, not the build, is the thing to check.
- **Advanced pill is 4px wider** than the reference (52 vs 48) while the Business pill matches
  within 1px. Same padding, so it's a glyph-width difference in the label.
- **Muted text color** `#868cac` is derived from a modal sample of dim antialiased label text,
  not a flat region. It's the least certain value in the palette.
- **Icon choices** (`Add logo` → lucide `Stamp`, `Edit using AI` → `ImagePlus`) remain the
  closest available equivalents; the Figma icons look custom. Export the SVGs to be exact.
- **Rail logo, qitaf badge, avatar** are stand-ins.
- **Blurred backdrop** behind the desktop modal is an abstract stand-in, per your call.
- **Light theme is invented** and has never been checked against a light frame.

## Out of scope — not gaps

Figma artboard chrome that is deliberately not built: the frame title captions, the green
`</>` badge on the mobile frame, and the blue "L" collaborator avatar on the desktop frame's
left edge.

`design-refs/build-crop-annotated.png` is the zoomed crop from the review that prompted this
pass. It is a screenshot of **this build**, not of the Figma — its card proportions match the
build (h/w 0.216) rather than the design (0.270).

---

## Re-running this check

```bash
pnpm dev
# screenshot /preview/image-detail at 1440x931 and 390x844 into shots/
python3 scripts/measure-ref.py compare design-refs/mobile.png  shots/mobile-final.png  --view mobile  --tolerance 5
python3 scripts/measure-ref.py compare design-refs/desktop.png shots/desktop-final.png --view desktop --tolerance 5
```

Exit code is non-zero when any channel exceeds the tolerance, so it can gate a commit.
