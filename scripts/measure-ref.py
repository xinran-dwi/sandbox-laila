#!/usr/bin/env python3
"""
Measure the Figma reference frames — colors and element rects — in design pixels.

Why this exists: the reference PNGs are macOS screenshots carrying a display ICC
profile, so their raw pixel values are NOT sRGB. Reading them straight gives colors
5-10 levels off, which is enough to build a whole palette wrong. Every command here
converts to sRGB first.

The second reason: a screenshot of a Figma frame sits on a gray canvas at some
arbitrary zoom. `locate` finds the artboard and returns the mapping, so every number
this script prints is in design px and directly comparable to CSS.

Usage
  measure-ref.py locate  <image>
  measure-ref.py colors  <image> --view mobile|desktop [--points name:x,y ...]
  measure-ref.py edges   <image> --view mobile|desktop --at x,y
  measure-ref.py crop    <image> --view mobile|desktop --rect x,y,w,h --out FILE
  measure-ref.py compare <reference> <screenshot> --view mobile|desktop

`compare` is the color check the first fidelity pass was missing: it samples both
images at the same design coordinates and prints per-channel deltas.
Screenshots produced by Playwright are already sRGB and already 1:1 with the design,
so pass --flat for them (compare does this automatically for the screenshot side).

Needs Python 3 + Pillow, both already present on this machine. No npm dependency.
"""

import argparse
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageCms

REPO = Path(__file__).resolve().parent.parent
SAMPLES = REPO / "design-refs" / "samples.json"

VIEWS = {"mobile": (390, 844), "desktop": (1440, 931)}


# ---------------------------------------------------------------- color space


def load_srgb(path):
    """Open an image and convert it out of its embedded display profile into sRGB."""
    im = Image.open(path)
    icc = im.info.get("icc_profile")
    im = im.convert("RGB")
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        dst = ImageCms.createProfile("sRGB")
        im = ImageCms.profileToProfile(im, src, dst, outputMode="RGB")
    return im


def hexof(c):
    return "#%02x%02x%02x" % tuple(c[:3])


def lum(c):
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def delta(a, b):
    return tuple(int(x) - int(y) for x, y in zip(a, b))


# ---------------------------------------------------------------- frame finding


def locate(im, design_w, design_h):
    """
    Find the artboard inside a Figma canvas screenshot.

    The canvas is mid-gray, the artboard is dark navy, so mask on "blue-dominant and
    dark" and take the extent. Returns (x0, y0, scale) mapping design px -> image px.
    Falls back to a flat 1:1 mapping when no navy region is found (i.e. the image is
    already just the rendered page, like a Playwright screenshot).
    """
    px = im.load()
    w, h = im.size

    def navy(c):
        return (c[2] - c[0]) > 25 and lum(c) < 110

    colf = [sum(1 for y in range(0, h, 2) if navy(px[x, y])) / (h / 2) for x in range(w)]
    rowf = [sum(1 for x in range(0, w, 2) if navy(px[x, y])) / (w / 2) for y in range(h)]
    xs = [x for x, f in enumerate(colf) if f > 0.3]
    ys = [y for y, f in enumerate(rowf) if f > 0.3]
    if not xs or not ys:
        return 0, 0, w / design_w

    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    if (x1 - x0 + 1) > w * 0.95 and (y1 - y0 + 1) > h * 0.95:
        # no gray surround: the image is the artboard
        return 0, 0, w / design_w
    return x0, y0, (x1 - x0 + 1) / design_w


class Frame:
    def __init__(self, im, view, flat=False):
        self.im = im
        self.px = im.load()
        self.w, self.h = im.size
        self.design_w, self.design_h = VIEWS[view]
        if flat:
            self.x0, self.y0, self.scale = 0, 0, self.w / self.design_w
        else:
            self.x0, self.y0, self.scale = locate(im, self.design_w, self.design_h)

    def at(self, dx, dy):
        x = round(self.x0 + dx * self.scale)
        y = round(self.y0 + dy * self.scale)
        x = max(0, min(self.w - 1, x))
        y = max(0, min(self.h - 1, y))
        return self.px[x, y]

    def to_design(self, ix, iy):
        return ((ix - self.x0) / self.scale, (iy - self.y0) / self.scale)

    def describe(self):
        return (
            f"origin ({self.x0}, {self.y0})  scale {self.scale:.4f}  "
            f"-> design {self.w / self.scale:.0f} x {self.h / self.scale:.0f}"
        )


# ---------------------------------------------------------------- edge finding


def edges(frame, dx, dy, tol=26):
    """
    Find the rect of the element under (dx, dy) by walking out along both axes until
    the color stops matching the element's fill.

    Scanning a centre line rather than counting matching pixels per row is deliberate:
    density banding clips antialiased rounded corners and under-measures every card.
    """
    fill = frame.at(dx, dy)

    def same(c):
        return sum(abs(int(a) - int(b)) for a, b in zip(c, fill)) < tol

    left = dx
    while left > 0 and same(frame.at(left - 1, dy)):
        left -= 0.5
    right = dx
    while right < frame.design_w and same(frame.at(right + 1, dy)):
        right += 0.5
    top = dy
    while top > 0 and same(frame.at(dx, top - 1)):
        top -= 0.5
    bottom = dy
    while bottom < frame.design_h and same(frame.at(dx, bottom + 1)):
        bottom += 0.5

    return {
        "fill": hexof(fill),
        "x": round(left, 1),
        "y": round(top, 1),
        "w": round(right - left, 1),
        "h": round(bottom - top, 1),
    }


# ---------------------------------------------------------------- commands


def load_points(view):
    if not SAMPLES.exists():
        return {}
    return json.loads(SAMPLES.read_text()).get(view, {}).get("points", {})


def cmd_locate(args):
    im = load_srgb(args.image)
    for view in VIEWS:
        f = Frame(im, view)
        print(f"as {view:8s}: {f.describe()}")


def cmd_colors(args):
    im = load_srgb(args.image)
    f = Frame(im, args.view, flat=args.flat)
    print(f"# {Path(args.image).name} — {f.describe()}")
    points = load_points(args.view)
    for p in args.points or []:
        name, coord = p.split(":")
        x, y = coord.split(",")
        points[name] = [float(x), float(y)]
    for name, (x, y) in points.items():
        print(f"  {name:22s} ({x:>6}, {y:>6})  {hexof(f.at(x, y))}")


def cmd_edges(args):
    im = load_srgb(args.image)
    f = Frame(im, args.view, flat=args.flat)
    x, y = (float(v) for v in args.at.split(","))
    r = edges(f, x, y)
    print(f"# {Path(args.image).name} — {f.describe()}")
    print(f"  at ({x}, {y}) fill {r['fill']}: x={r['x']} y={r['y']} w={r['w']} h={r['h']}")


def cmd_compare(args):
    ref = Frame(load_srgb(args.reference), args.view)
    shot = Frame(load_srgb(args.screenshot), args.view, flat=True)
    points = load_points(args.view)
    if not points:
        sys.exit(f"no sample points for view '{args.view}' in {SAMPLES}")

    print(f"# reference  {Path(args.reference).name}  {ref.describe()}")
    print(f"# build      {Path(args.screenshot).name}  {shot.describe()}")
    print(f"\n{'point':22s} {'design':>14s}  {'figma':9s} {'build':9s} {'delta':>16s}")
    worst = 0
    for name, (x, y) in points.items():
        a, b = ref.at(x, y), shot.at(x, y)
        d = delta(a, b)
        worst = max(worst, max(abs(v) for v in d))
        flag = "  <-- off" if max(abs(v) for v in d) > args.tolerance else ""
        print(
            f"{name:22s} ({x:>5},{y:>5})  {hexof(a)}  {hexof(b)}  "
            f"{str(d):>16s}{flag}"
        )
    print(f"\nworst channel delta: {worst} (tolerance {args.tolerance})")
    return 1 if worst > args.tolerance else 0



def cmd_crop(args):
    """Cut a design-px rectangle out of a reference frame at source resolution."""
    im = load_srgb(args.image)
    f = Frame(im, args.view)
    x, y, w, h = (float(v) for v in args.rect.split(","))
    box = (
        round(f.x0 + x * f.scale),
        round(f.y0 + y * f.scale),
        round(f.x0 + (x + w) * f.scale),
        round(f.y0 + (y + h) * f.scale),
    )
    out = im.crop(box)
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    out.save(args.out, quality=92)
    print(f"  {args.out}  {out.size[0]}x{out.size[1]}px  (design {w:g}x{h:g})")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("locate"); p.add_argument("image"); p.set_defaults(fn=cmd_locate)

    p = sub.add_parser("colors")
    p.add_argument("image"); p.add_argument("--view", required=True, choices=VIEWS)
    p.add_argument("--points", nargs="*"); p.add_argument("--flat", action="store_true")
    p.set_defaults(fn=cmd_colors)

    p = sub.add_parser("edges")
    p.add_argument("image"); p.add_argument("--view", required=True, choices=VIEWS)
    p.add_argument("--at", required=True); p.add_argument("--flat", action="store_true")
    p.set_defaults(fn=cmd_edges)

    p = sub.add_parser("crop")
    p.add_argument("image"); p.add_argument("--view", required=True, choices=VIEWS)
    p.add_argument("--rect", required=True, help="x,y,w,h in design px")
    p.add_argument("--out", required=True)
    p.set_defaults(fn=cmd_crop)

    p = sub.add_parser("compare")
    p.add_argument("reference"); p.add_argument("screenshot")
    p.add_argument("--view", required=True, choices=VIEWS)
    p.add_argument("--tolerance", type=int, default=4)
    p.set_defaults(fn=cmd_compare)

    args = ap.parse_args()
    sys.exit(args.fn(args) or 0)


if __name__ == "__main__":
    main()
