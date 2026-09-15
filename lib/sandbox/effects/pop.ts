import type { EffectDef } from "../types";

/**
 * A one-shot attention punch. Triggered manually here so it can be watched on
 * demand; in real code you toggle the class (or a data attribute) when the
 * thing you want to celebrate happens.
 */
export const pop: EffectDef = {
  id: "pop",
  name: "Pop",
  blurb: "Springy scale punch. Good for confirming an action landed.",
  kind: "emphasis",
  trigger: { type: "manual" },
  requires: ["transform"],
  portability: "css",
  notes:
    "Runs when the class is applied. Toggle it on the event you want to mark, " +
    "and remove it on animationend so it can run again.",
  params: [
    {
      id: "scale",
      label: "Overshoot",
      kind: "number",
      cssVar: "--fx-pop-scale",
      default: 1.08,
      min: 1,
      max: 1.4,
      step: 0.01,
      unit: "",
    },
    {
      id: "settle",
      label: "Settle dip",
      kind: "number",
      cssVar: "--fx-pop-settle",
      default: 0.98,
      min: 0.9,
      max: 1,
      step: 0.005,
      unit: "",
    },
    {
      id: "duration",
      label: "Duration",
      kind: "number",
      cssVar: "--fx-pop-duration",
      default: 420,
      min: 120,
      max: 1400,
      step: 20,
      unit: "ms",
    },
    {
      id: "ease",
      label: "Easing",
      kind: "select",
      cssVar: "--fx-pop-ease",
      default: "spring",
      options: [
        { value: "spring", label: "Springy", css: "cubic-bezier(.34,1.56,.64,1)" },
        { value: "out", label: "Ease out", css: "cubic-bezier(.16,1,.3,1)" },
      ],
    },
  ],
  css: (v) => ({
    keyframes: {
      pop: `0% { transform: scale(1); }
  45% { transform: scale(${v("scale")}); }
  70% { transform: scale(${v("settle")}); }
  100% { transform: scale(1); }`,
    },
    animation: { name: "pop", shorthand: `${v("duration")} ${v("ease")} both` },
    base: { "transform-origin": "center" },
  }),
};
