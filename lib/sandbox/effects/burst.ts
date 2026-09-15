import type { EffectDef } from "../types";

/**
 * Confetti. The one effect here that genuinely needs JS, because the particles
 * don't exist until the click happens.
 *
 * Note what it does NOT do: it doesn't own its motion in JS. The runtime
 * creates N spans, sets --x / --y / --r per particle, and removes them on
 * animationend. Every bit of the movement is the keyframe below, rendered by
 * the same machinery as every other effect — so tuning and export work the
 * same way, and there's very little that can drift.
 */
export const burst: EffectDef = {
  id: "burst",
  name: "Confetti burst",
  blurb: "Particles fly out from the element when it's clicked.",
  kind: "celebration",
  trigger: {
    type: "event",
    dom: "click",
    // Fire when the thumb goes DOWN, not when it's un-pressed. Evaluated after
    // a frame so React's state update has committed.
    when: { attr: "aria-pressed", equals: "true" },
  },
  requires: ["click"],
  portability: "css+js",
  notes:
    "Needs ~12 lines of JS to spawn the particles; all motion is the keyframe. " +
    "See the JS tab for a drop-in component.",
  params: [
    {
      id: "count",
      label: "Particles",
      kind: "number",
      cssVar: "--fx-burst-count",
      default: 18,
      min: 4,
      max: 60,
      step: 1,
      unit: "",
    },
    {
      id: "distance",
      label: "Spread",
      kind: "number",
      cssVar: "--fx-burst-distance",
      default: 90,
      min: 20,
      max: 240,
      step: 5,
      unit: "px",
    },
    {
      id: "size",
      label: "Size",
      kind: "number",
      cssVar: "--fx-burst-size",
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
      cssVar: "--fx-burst-duration",
      default: 900,
      min: 300,
      max: 2400,
      step: 50,
      unit: "ms",
    },
    {
      id: "gravity",
      label: "Gravity",
      kind: "number",
      cssVar: "--fx-burst-gravity",
      default: 60,
      min: 0,
      max: 240,
      step: 10,
      unit: "px",
    },
    {
      id: "palette",
      label: "Colors",
      kind: "select",
      cssVar: "--fx-burst-palette",
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
        {
          value: "lime",
          label: "Lime only",
          css: "var(--accent-lime)",
        },
      ],
    },
  ],
  particles: {
    keyframe: "fly",
    countParam: "count",
    sizeParam: "size",
    colorParam: "palette",
    easing: "cubic-bezier(.15,.7,.3,1)",
    // Burst fires everything at once; the keyframe's own random delay is enough.
    place: (i, n, values) => {
      const distance = Number(values.distance ?? 90);
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const reach = distance * (0.55 + Math.random() * 0.65);
      return {
        "--x": `${Math.cos(angle) * reach}px`,
        "--y": `${Math.sin(angle) * reach}px`,
        "--r": `${Math.round(Math.random() * 720 - 360)}deg`,
      };
    },
    exportSnippet: `// Radial confetti burst. Pair with the CSS from the CSS tab.
export function burstFrom(el, opts = {}) {
  const { count = 18, distance = 90, size = 7, duration = 900,
          colors = ["#d8e200", "#e6b9ff", "#f2f4fd"] } = opts;
  const box = el.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
  document.body.append(layer);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const reach = distance * (0.55 + Math.random() * 0.65);
    const p = document.createElement("span");
    p.style.cssText =
      \`position:absolute;left:\${box.left + box.width / 2}px;top:\${box.top + box.height / 2}px;\` +
      \`width:\${size}px;height:\${size}px;border-radius:\${i % 3 === 0 ? "2px" : "50%"};\` +
      \`background:\${colors[i % colors.length]};\` +
      \`animation:%KEYFRAME% \${duration}ms cubic-bezier(.15,.7,.3,1) both\`;
    p.style.setProperty("--x", \`\${Math.cos(angle) * reach}px\`);
    p.style.setProperty("--y", \`\${Math.sin(angle) * reach}px\`);
    p.style.setProperty("--r", \`\${Math.round(Math.random() * 720 - 360)}deg\`);
    p.addEventListener("animationend", () => p.remove(), { once: true });
    layer.append(p);
  }
  setTimeout(() => layer.remove(), duration + 400);
}`,
  },
  css: (v) => ({
    keyframes: {
      fly: `0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y) + ${v("gravity")})) rotate(var(--r)) scale(.4); opacity: 0; }`,
    },
    animation: {
      name: "fly",
      shorthand: `${v("duration")} cubic-bezier(.15,.7,.3,1) forwards`,
    },
  }),
};
