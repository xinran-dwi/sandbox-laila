# Design Sandbox

A code-based reproduction of the Figma designs, built so motion and microinteraction ideas
can be explored in a real browser and handed to engineers as reference code.

```bash
pnpm install
pnpm dev
```

- `/` — screen index
- `/sandbox/image-detail` — sandbox shell: desktop / mobile and dark / light toggles around a
  live preview
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
a raw hex — that's what made correcting the entire palette a single-file edit.

That discipline was not actually airtight. An earlier version of this file claimed it kept the
theme toggle "a one-file change"; it didn't, because `DesktopViewer` painted its whole backdrop
in `bg-white/20` and its nav arrows in `bg-white/[0.09]`. Both vanish on a light surface. Alpha
washes that sit *on top* of a surface need their own inverting tokens — `--surface-skeleton`,
`--surface-chip`, `--surface-chip-hover` — not a flat hex and not a bare white.

**The shell drives the screen over a postMessage bridge.** `components/sandbox/SandboxBridge.tsx`
runs inside the preview and applies what the shell sends it; `useSandboxBridge` is the shell half.
Two rules keep it honest: messages carry a full snapshot rather than a delta, and the handshake is
child-initiated — the preview announces itself on every mount and the shell replies with current
state. That makes Fast Refresh, manual reload and viewport switching self-healing without
detecting any of them, because `iframe.onload` fires before React hydrates and is not a readiness
signal. The bridge no-ops when `window.parent === window`, so opening `/preview/*` directly gives
you the untouched deliverable.

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

## Theme

The toolbar toggles dark / light; the preference persists per browser. Dark is the default and
what the design was measured against.

**Light is invented.** It was derived from the corrected dark values and has never been checked
against a light Figma frame — see `FIDELITY_REPORT.md`. Treat it as a starting point to react to,
not a verified design.

## Next

A motion panel for exploring microinteractions on registered components, viewport switching
beyond the two presets, and a code-view panel — the toolbar carries a visible stub where the
motion panel lands.
