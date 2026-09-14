# Fidelity Report — Image Detail screen

**Ground truth:** two Figma frame exports (`Image-info-custom-description-added`, desktop ·
`All actions visible with focus of cont…`, mobile), supplied as images in chat.
**Method:** screenshot comparison + rendered geometry measurement (`getBoundingClientRect`).
**Renders compared:** `shots/desktop-v3.png` (1440×930), `shots/mobile-v2.png` (390×844).

> ⚠️ **This check ran in the weakest of the three ground-truth modes.** There is no live app
> to render real component source from — the reference is a static picture — and the PNG
> files themselves are not on disk yet, so every reference coordinate below was read by eye
> off the image rather than measured in pixels. Treat reference numbers as ±5–10px and the
> color tokens as unverified. See *Blocked* at the bottom.

## Matched (measured)

| Element | Reference (est.) | Sandbox (measured) |
| --- | --- | --- |
| Mobile header block height | 130px | 130px |
| Mobile hero image | y=130, h=325 (390×325, 1.2:1) | y=130, h=325 |
| Mobile action card | 171 × 67 | 171 × 67 |
| Mobile grid inset / column gap | 20px / 8px | 20px / 8px |
| Mobile CTA | h≈55, full width less 20px gutters | h=55, x=20, w=350 |
| Desktop nav rail width | ≈78px | 84px (−6 off) |
| Desktop right panel width | ≈500px | 500px |
| Desktop panel content column | ≈410px | 410px |
| Desktop action card | ≈200 × 45 | 200 × 45 |
| Desktop action grid block | y=93 → 266 | y=96 → 266 |
| Desktop viewer image | ≈500 × 500, centered | 500 × 500, centered |
| Desktop CTA | h≈40, 22px above panel bottom | h=40, 22px bottom padding |

## Fixed during this pass

1. **Mobile overflowed the 844px frame** — action cards were 88px tall with 14px gaps.
   Corrected to the measured 67px / 8px, which puts the CTA back at y=773 (ref ≈777).
2. **Desktop panel content was clipped** — section dividers carried 23px margins, pushing
   ~78px of drift down the panel so the `Content` list fell below the fold. Reference shows
   every section plus slack above the CTA. Dividers now `my-[15px]`.
3. **Viewer image was undersized** (445px vs ≈500px) and the arrow buttons sat ~38px too far
   inboard.
4. **Mobile header had no status-bar allowance** — the Figma frame reserves ≈46px above the
   back row that it doesn't draw.
5. **Broken-image alt text** was rendering inside photo slots; `Photo` now hides the `<img>`
   until it actually loads, leaving the gradient placeholder.
6. **Next.js dev indicator** was baked into screenshots — disabled via `devIndicators: false`.

## Open — needs the reference PNGs

1. **All photography is a gradient placeholder.** `/img/hero-mobile.jpg`, `hero-desktop.jpg`,
   `reference.jpg`, `thumb-1.jpg`, `thumb-2.jpg` 404 by design. They get cropped out of
   `design-refs/*.png` once those land.
2. **Every color token is eyeballed**, not sampled. `app/globals.css` is the only file that
   needs editing when the real values are read — no component hardcodes a hex.
3. **Light theme is invented.** It exists so the upcoming toggle has a target; it has never
   been checked against a light Figma frame.

## Approximations flagged deliberately

- **Icon choices.** `Add logo` (lucide `Stamp`) and `Edit using AI` (`ImagePlus`) are the
  closest lucide equivalents; the Figma icons look custom. Swap for exported SVGs if exact.
- **Rail logo.** "Daem AI" wordmark + crescent is a stand-in built from type and a border —
  the real mark should be exported from Figma.
- **Blurred backdrop** behind the desktop modal is an abstract stand-in (per your call), not
  the real gallery page.
- **Avatar / qitaf badge** are colored stand-ins.

## Out of scope — not gaps

These are Figma artboard chrome, deliberately not built: the frame title captions above each
export, the green `</>` badge on the mobile frame, and the blue "L" collaborator avatar
overlapping the desktop frame's left edge.

## Blocked

`design-refs/desktop.png` and `design-refs/mobile.png` were never saved, so the pixel-accurate
passes (color sampling, image cropping, automated diffing) could not run. Drop them in and
re-run this check to close the three Open items above.
