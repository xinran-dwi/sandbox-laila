import type { EffectDef } from "../types";

/**
 * The state effect devs actually ship for a button: a transition plus a
 * :hover / :active transform. No keyframes, so it exports as a handful of
 * ordinary utilities.
 */
export const press: EffectDef = {
  id: "press",
  name: "Press & lift",
  blurb: "Settles down on press, lifts slightly on hover.",
  kind: "states",
  trigger: { type: "press" },
  requires: ["transform"],
  portability: "css",
  params: [
    {
      id: "dip",
      label: "Press scale",
      kind: "number",
      cssVar: "--fx-press-dip",
      default: 0.97,
      min: 0.85,
      max: 1,
      step: 0.005,
      unit: "",
    },
    {
      id: "lift",
      label: "Hover scale",
      kind: "number",
      cssVar: "--fx-press-lift",
      default: 1.02,
      min: 1,
      max: 1.15,
      step: 0.005,
      unit: "",
    },
    {
      id: "duration",
      label: "Duration",
      kind: "number",
      cssVar: "--fx-press-duration",
      default: 150,
      min: 40,
      max: 600,
      step: 10,
      unit: "ms",
    },
    {
      id: "ease",
      label: "Easing",
      kind: "select",
      cssVar: "--fx-press-ease",
      default: "out",
      options: [
        { value: "out", label: "Ease out", css: "cubic-bezier(.16,1,.3,1)" },
        { value: "spring", label: "Springy", css: "cubic-bezier(.34,1.56,.64,1)" },
        { value: "linear", label: "Linear", css: "linear" },
      ],
    },
  ],
  css: (v) => ({
    base: {
      "transform-origin": "center",
      transition: `transform ${v("duration")} ${v("ease")}`,
    },
    states: {
      hover: { transform: `scale(${v("lift")})` },
      active: { transform: `scale(${v("dip")})` },
    },
  }),
};
