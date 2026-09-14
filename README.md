# Design Sandbox

A code-based reproduction of the Figma designs, built so motion and microinteraction ideas
can be explored in a real browser and handed to engineers as reference code.

```bash
pnpm install
pnpm dev
```

- `/` — screen index
- `/sandbox/image-detail` — sandbox shell: desktop / mobile toggle around a live preview
- `/preview/image-detail` — the screen on its own, no sandbox chrome

## How it's put together

**The preview route is the deliverable.** `/preview/*` renders a normal responsive page with
normal Tailwind breakpoints and no awareness that a sandbox exists. That's the code engineers
read and copy.

**The sandbox wraps it in an iframe.** `components/sandbox/DeviceFrame.tsx` sizes the iframe
to a true 1440×930 or 390×844, so the page's own media queries fire exactly as they would on
a real device — no transform tricks, no container-query rewrite of the page code. It scales
down only when the window can't fit the frame 1:1.

**Every color and radius is a token, and the dark values are measured.** `app/globals.css`
defines the whole palette twice, under `[data-theme="dark"]` and `[data-theme="light"]`.
Components reference token-backed utilities (`bg-card`, `text-ink-muted`, `bg-lime`) and never
a raw hex — that's what keeps the theme toggle a one-file change, and what made correcting the
entire palette a single-file edit.

**Copy and asset paths live in fixtures.** `lib/fixtures/image-detail.ts` holds every string
and image path on the screen.

## Checking fidelity

`scripts/measure-ref.py` measures the Figma exports in `design-refs/` and compares this build
against them. It exists because eyeballing colors does not work: the first version of this
screen shipped a whole palette that was visibly wrong to anyone who looked, and passed a
review that only ever measured geometry.

```bash
python3 scripts/measure-ref.py locate  design-refs/mobile.png
python3 scripts/measure-ref.py colors  design-refs/desktop.png --view desktop
python3 scripts/measure-ref.py edges   design-refs/desktop.png --view desktop --at 1000,110
python3 scripts/measure-ref.py crop    design-refs/mobile.png --view mobile --rect 0,133,390,320 --out public/img/hero-mobile.jpg
python3 scripts/measure-ref.py compare design-refs/mobile.png shots/mobile-final.png --view mobile --tolerance 5
```

Two things make its numbers trustworthy:

- **It converts out of the display ICC profile first.** These references are macOS
  screenshots; their raw pixels are not sRGB, and reading them directly is off by 5-10 levels.
- **It works in design pixels.** `locate` finds the artboard inside the gray Figma canvas and
  returns the scale, so every number it prints compares directly to CSS.

`compare` exits non-zero when a channel drifts past the tolerance. Sample points live in
`design-refs/samples.json` — keep them inside flat regions, off text strokes and photography.
Python 3 + Pillow only; nothing added to `package.json`.

## Layout

```
app/
  preview/image-detail/   the real page
  sandbox/[screen]/       the shell around it
components/
  screens/image-detail/   one component per region of the screen
  sandbox/                shell + device frame
lib/fixtures/             copy and asset paths
design-refs/              the Figma exports this is measured against
shots/                    verification screenshots
```

## Fidelity

`FIDELITY_REPORT.md` records how closely this matches the Figma frames, what was measured,
what's still approximate, and why — including a correction of what an earlier pass got wrong
and how its method let that through. Read it before assuming a value is intentional.

## Next

Theme toggle, viewport switching beyond the two presets, an interaction inspector, and a
code-view panel — the toolbar carries visible stubs where each one lands.
