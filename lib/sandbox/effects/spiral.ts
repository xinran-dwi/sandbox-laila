import type { EffectDef } from "../types";

/**
 * Confetti that climbs in a helix and dissolves at the top.
 *
 * The whole spiral is one keyframe and two per-particle custom properties. The
 * transform order is what makes it work:
 *
 *   translate(-50%,-50%) translateY(rise) rotate(a0 + turns) translateX(rad)
 *
 * centre, then climb in SCREEN space, then rotate, then push out by the radius
 * — so the rotation only swings the offset and never tilts the climb. Measured
 * in a browser rather than assumed: at radius 40 / rise -200 / turns 720, x
 * oscillates +-40 while y falls linearly through -54, -104, -154. A helix.
 *
 * Two details that are easy to get wrong:
 *  - Rotation interpolates continuously past 360deg (through 180/360/540), so
 *    multi-turn spirals work rather than snapping to a shortest path.
 *  - The 12% and 65% steps set ONLY opacity. Transform still interpolates
 *    across the full duration, because CSS animates each property over the
 *    keyframes that mention it — that's what gives a fade in and out without
 *    interrupting the climb.
 */
export const spiral: EffectDef = {
  id: "spiral",
  name: "Spiral rise",
  blurb: "Confetti climbs in a converging helix, then fades at the top.",
  kind: "celebration",
  trigger: {
    type: "event",
    dom: "click",
    when: { attr: "aria-pressed", equals: "true" },
  },
  requires: ["click"],
  portability: "css+js",
  notes:
    "Needs ~14 lines of JS to spawn the particles; the helix itself is entirely " +
    "the keyframe. Each particle only needs a start angle and a radius.",
  params: [
    {
      id: "count",
      label: "Particles",
      kind: "number",
      cssVar: "--fx-spiral-count",
      default: 16,
      min: 4,
      max: 48,
      step: 1,
      unit: "",
    },
    {
      id: "rise",
      label: "Height",
      kind: "number",
      cssVar: "--fx-spiral-rise",
      default: 150,
      min: 40,
      max: 400,
      step: 10,
      unit: "px",
    },
    {
      id: "radius",
      label: "Start radius",
      kind: "number",
      cssVar: "--fx-spiral-radius",
      default: 46,
      min: 8,
      max: 140,
      step: 2,
      unit: "px",
    },
    {
      id: "taper",
      label: "Converge to",
      kind: "number",
      cssVar: "--fx-spiral-taper",
      default: 0.25,
      min: 0.05,
      max: 1.6,
      step: 0.05,
      unit: "",
      help: "Below 1 narrows as it climbs; above 1 blooms outward.",
    },
    {
      id: "turns",
      label: "Rotation",
      kind: "number",
      cssVar: "--fx-spiral-turns",
      default: 540,
      min: 90,
      max: 1440,
      step: 30,
      unit: "deg",
    },
    {
      id: "stagger",
      label: "Stagger",
      kind: "number",
      cssVar: "--fx-spiral-stagger",
      default: 35,
      min: 0,
      max: 160,
      step: 5,
      unit: "ms",
      help: "Delay between particles, so the ribbon draws itself.",
    },
    {
      id: "size",
      label: "Size",
      kind: "number",
      cssVar: "--fx-spiral-size",
      default: 7,
      min: 2,
      max: 18,
      step: 1,
      unit: "px",
    },
    {
      id: "duration",
      label: "Duration",
      kind: "number",
      cssVar: "--fx-spiral-duration",
      default: 1500,
      min: 400,
      max: 3500,
      step: 50,
      unit: "ms",
    },
    {
      id: "ease",
      label: "Easing",
      kind: "select",
      cssVar: "--fx-spiral-ease",
      default: "glide",
      options: [
        // Gentle deceleration: the climb stays readable the whole way up.
        { value: "glide", label: "Glide", css: "cubic-bezier(.25,.46,.45,.94)" },
        { value: "linear", label: "Steady", css: "linear" },
        // Fast launch, long hang — good for a short burst upward.
        { value: "launch", label: "Launch", css: "cubic-bezier(.15,.7,.3,1)" },
      ],
    },
    {
      id: "palette",
      label: "Colors",
      kind: "select",
      cssVar: "--fx-spiral-palette",
      default: "brand",
      options: [
        {
          value: "brand",
          label: "Brand",
          css: "var(--accent-lime), var(--badge-advanced-bg), var(--text-primary)",
        },
        {
          value: "rainbow",
          label: "Rainbow",
          css: "#ff4d6d, #ffd166, #06d6a0, #4cc9f0",
        },
        { value: "lime", label: "Lime only", css: "var(--accent-lime)" },
      ],
    },
  ],
  particles: {
    keyframe: "climb",
    countParam: "count",
    sizeParam: "size",
    colorParam: "palette",
    staggerParam: "stagger",
    easingParam: "ease",
    easing: "cubic-bezier(.25,.46,.45,.94)",
    place: (i, n, values) => {
      const radius = Number(values.radius ?? 46);
      // Spread the launch phases evenly around the circle so consecutive
      // particles don't stack, then jitter so it doesn't read as a machine.
      const a0 = (360 / n) * i + Math.random() * 18 - 9;
      return {
        "--a0": `${a0}deg`,
        "--rad": `${radius * (0.8 + Math.random() * 0.4)}px`,
      };
    },
    exportSnippet: `// Spiral confetti. Pair with the CSS from the CSS tab.
// The helix is the keyframe; this only picks a start angle and radius.
export function spiralFrom(el, opts = {}) {
  const { count = 16, radius = 46, size = 7, duration = 1500, stagger = 35,
          colors = ["#d8e200", "#e6b9ff", "#f2f4fd"] } = opts;
  const box = el.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
  document.body.append(layer);

  for (let i = 0; i < count; i++) {
    const a0 = (360 / count) * i + Math.random() * 18 - 9;
    const p = document.createElement("span");
    p.style.cssText =
      "position:absolute;left:" + (box.left + box.width / 2) + "px;" +
      "top:" + (box.top + box.height / 2) + "px;" +
      "width:" + size + "px;height:" + size + "px;" +
      "border-radius:" + (i % 3 === 0 ? "2px" : "50%") + ";" +
      "background:" + colors[i % colors.length] + ";" +
      "animation:%KEYFRAME% " + duration + "ms cubic-bezier(.25,.46,.45,.94) both;" +
      "animation-delay:" + (i * stagger) + "ms";
    p.style.setProperty("--a0", a0 + "deg");
    p.style.setProperty("--rad", radius * (0.8 + Math.random() * 0.4) + "px");
    p.addEventListener("animationend", () => p.remove(), { once: true });
    layer.append(p);
  }
  setTimeout(() => layer.remove(), duration + count * stagger + 400);
}`,
  },
  css: (v) => ({
    keyframes: {
      climb: `0% { transform: translate(-50%, -50%) translateY(0) rotate(var(--a0, 0deg)) translateX(var(--rad, 46px)); opacity: 0; }
  12% { opacity: 1; }
  65% { opacity: 1; }
  100% { transform: translate(-50%, -50%) translateY(calc(-1 * ${v("rise")})) rotate(calc(var(--a0, 0deg) + ${v("turns")})) translateX(calc(var(--rad, 46px) * ${v("taper")})); opacity: 0; }`,
    },
    animation: {
      name: "climb",
      shorthand: `${v("duration")} ${v("ease")} both`,
    },
  }),
};
