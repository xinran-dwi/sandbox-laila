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
