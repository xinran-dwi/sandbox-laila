import type { EffectDef } from "../types";

/**
 * The lucide `thumbs-up` path, so the flying thumbs are literally the same
 * shape as the icon in the button. Filled AND stroked in one colour: a pure
 * outline disappears at ~18px while moving, so this reads as a solid glyph.
 */
const THUMB_GLYPH = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/></svg>`;

/**
 * Thumbs-up fountain: thumbs shoot up and outward, slow at the peak, then fall
 * back down past where they launched.
 *
 * The trajectory is projectile motion — x linear, y quadratic:
 *
 *   x(t) = vx · t
 *   y(t) = -rise · 4t(1-t) + fall · t²
 *
 * sampled across eight keyframe steps. A two-step keyframe interpolates both
 * axes linearly and gives a straight line, so the parabola has to be sampled.
 * The alternatives — nested elements, or offset-path — cost either two
 * intertwined animations or per-particle parameterisation, and this keeps it to
 * ONE element, ONE keyframe, ONE animation, which is also what makes the export
 * a single paste-able block.
 *
 * Measured rather than assumed: at vx 90 / rise 160 / fall 120 the path peaks
 * at y -143 around t=0.45 and ends at +111, below the start, while x drifts
 * evenly to 81.
 *
 * Timing must stay LINEAR. The sampled steps are the physics; an eased curve
 * would resample them and bend the arc.
 */
export const fountain: EffectDef = {
  id: "fountain",
  name: "Thumbs-up fountain",
  blurb: "Thumbs-ups arc up and outward, then fall back down.",
  kind: "celebration",
  trigger: {
    type: "event",
    dom: "click",
    when: { attr: "aria-pressed", equals: "true" },
  },
  requires: ["click"],
  portability: "css+js",
  notes:
    "Needs ~16 lines of JS to spawn the thumbs; the arc itself is entirely the " +
    "keyframe. Keep the timing function linear — the keyframe steps are the " +
    "trajectory, so easing them distorts the parabola.",
  params: [
    {
      id: "count",
      label: "Thumbs",
      kind: "number",
      cssVar: "--fx-fountain-count",
      default: 14,
      min: 3,
      max: 40,
      step: 1,
      unit: "",
    },
    {
      id: "rise",
      label: "Peak height",
      kind: "number",
      cssVar: "--fx-fountain-rise",
      default: 160,
      min: 40,
      max: 400,
      step: 10,
      unit: "px",
    },
    {
      id: "spread",
      label: "Spread",
      kind: "number",
      cssVar: "--fx-fountain-spread",
      default: 90,
      min: 0,
      max: 260,
      step: 5,
      unit: "px",
      help: "How far the spray fans out to each side.",
    },
    {
      id: "fall",
      label: "Fall past start",
      kind: "number",
      cssVar: "--fx-fountain-fall",
      default: 140,
      min: 0,
      max: 500,
      step: 10,
      unit: "px",
    },
    {
      id: "spin",
      label: "Tumble",
      kind: "number",
      cssVar: "--fx-fountain-spin",
      default: 200,
      min: 0,
      max: 720,
      step: 20,
      unit: "deg",
    },
    {
      id: "size",
      label: "Size",
      kind: "number",
      cssVar: "--fx-fountain-size",
      default: 18,
      min: 8,
      max: 44,
      step: 1,
      unit: "px",
    },
    {
      id: "stagger",
      label: "Stagger",
      kind: "number",
      cssVar: "--fx-fountain-stagger",
      default: 45,
      min: 0,
      max: 200,
      step: 5,
      unit: "ms",
    },
    {
      id: "duration",
      label: "Duration",
      kind: "number",
      cssVar: "--fx-fountain-duration",
      default: 1600,
      min: 500,
      max: 4000,
      step: 50,
      unit: "ms",
    },
    {
      id: "palette",
      label: "Colors",
      kind: "select",
      cssVar: "--fx-fountain-palette",
      default: "brand",
      options: [
        {
          value: "brand",
          label: "Brand",
          css: "var(--accent-lime), var(--badge-advanced-bg), var(--text-primary)",
        },
        { value: "lime", label: "Lime only", css: "var(--accent-lime)" },
        {
          value: "rainbow",
          label: "Rainbow",
          css: "#ff4d6d, #ffd166, #06d6a0, #4cc9f0",
        },
      ],
    },
  ],
  particles: {
    keyframe: "arc",
    countParam: "count",
    sizeParam: "size",
    colorParam: "palette",
    staggerParam: "stagger",
    easing: "linear",
    glyph: THUMB_GLYPH,
    place: (i, n, values) => {
      const spread = Number(values.spread ?? 90);
      const rise = Number(values.rise ?? 160);
      const fall = Number(values.fall ?? 140);
      const spin = Number(values.spin ?? 200);

      // Alternate sides and step outward, so the spray opens into a fan rather
      // than every thumb drifting the same way.
      const side = i % 2 === 0 ? 1 : -1;
      const rank = Math.floor(i / 2) / Math.max(1, Math.ceil(n / 2) - 1 || 1);
      const vx = side * spread * (0.25 + rank * 0.75) * (0.85 + Math.random() * 0.3);

      return {
        "--vx": `${vx.toFixed(1)}px`,
        // Vary the peak so the tops don't land on a flat line.
        "--rise": `${(rise * (0.8 + Math.random() * 0.4)).toFixed(1)}px`,
        "--fall": `${(fall * (0.9 + Math.random() * 0.3)).toFixed(1)}px`,
        "--spin": `${Math.round((Math.random() * 2 - 1) * spin)}deg`,
      };
    },
    exportSnippet: `// Thumbs-up fountain. Pair with the CSS from the CSS tab.
// The arc is the keyframe; this only picks a velocity, height and tumble.
const THUMB = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/></svg>';

export function fountainFrom(el, opts = {}) {
  const { count = 14, rise = 160, spread = 90, fall = 140, spin = 200,
          size = 18, duration = 1600, stagger = 45,
          colors = ["#d8e200", "#e6b9ff", "#f2f4fd"] } = opts;
  const box = el.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
  document.body.append(layer);

  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const rank = Math.floor(i / 2) / Math.max(1, Math.ceil(count / 2) - 1 || 1);
    const vx = side * spread * (0.25 + rank * 0.75) * (0.85 + Math.random() * 0.3);

    const p = document.createElement("span");
    p.innerHTML = THUMB;
    p.style.cssText =
      "position:absolute;line-height:0;" +
      "left:" + (box.left + box.width / 2) + "px;" +
      "top:" + (box.top + box.height / 2) + "px;" +
      "width:" + size + "px;height:" + size + "px;" +
      "color:" + colors[i % colors.length] + ";" +
      "animation:%KEYFRAME% " + duration + "ms linear both;" +
      "animation-delay:" + (i * stagger) + "ms";
    p.style.setProperty("--vx", vx.toFixed(1) + "px");
    p.style.setProperty("--rise", (rise * (0.8 + Math.random() * 0.4)).toFixed(1) + "px");
    p.style.setProperty("--fall", (fall * (0.9 + Math.random() * 0.3)).toFixed(1) + "px");
    p.style.setProperty("--spin", Math.round((Math.random() * 2 - 1) * spin) + "deg");
    p.addEventListener("animationend", () => p.remove(), { once: true });
    layer.append(p);
  }
  setTimeout(() => layer.remove(), duration + count * stagger + 400);
}`,
  },
  css: () => ({
    keyframes: {
      // x = vx·t, y = -rise·4t(1-t) + fall·t², sampled every 15%.
      arc: `0% { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg); opacity: 1; }
  15% { transform: translate(-50%, -50%) translate(calc(var(--vx, 0px) * .15), calc(var(--rise, 160px) * -.51 + var(--fall, 140px) * .02)) rotate(calc(var(--spin, 0deg) * .15)); }
  30% { transform: translate(-50%, -50%) translate(calc(var(--vx, 0px) * .30), calc(var(--rise, 160px) * -.84 + var(--fall, 140px) * .09)) rotate(calc(var(--spin, 0deg) * .30)); }
  45% { transform: translate(-50%, -50%) translate(calc(var(--vx, 0px) * .45), calc(var(--rise, 160px) * -.99 + var(--fall, 140px) * .20)) rotate(calc(var(--spin, 0deg) * .45)); }
  60% { transform: translate(-50%, -50%) translate(calc(var(--vx, 0px) * .60), calc(var(--rise, 160px) * -.96 + var(--fall, 140px) * .36)) rotate(calc(var(--spin, 0deg) * .60)); }
  75% { transform: translate(-50%, -50%) translate(calc(var(--vx, 0px) * .75), calc(var(--rise, 160px) * -.75 + var(--fall, 140px) * .56)) rotate(calc(var(--spin, 0deg) * .75)); opacity: 1; }
  90% { transform: translate(-50%, -50%) translate(calc(var(--vx, 0px) * .90), calc(var(--rise, 160px) * -.36 + var(--fall, 140px) * .81)) rotate(calc(var(--spin, 0deg) * .90)); }
  100% { transform: translate(-50%, -50%) translate(var(--vx, 0px), var(--fall, 140px)) rotate(var(--spin, 0deg)); opacity: 0; }`,
    },
    animation: { name: "arc", shorthand: "var(--fx-fountain-duration, 1600ms) linear both" },
  }),
};
