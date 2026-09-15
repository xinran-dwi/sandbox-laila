import type { EffectDef } from "../types";

/**
 * Loading skeleton sweep, painted through ::after so nothing is inserted into
 * the screen's own tree.
 *
 * The trigger is a SIMULATED flag, not a real load event. Photo.tsx documents
 * why: a cached image finishes before React attaches its handler, so the load
 * event never fires and the state would be unreviewable. The panel sets the
 * flag for a chosen duration instead, which is also scrubbable.
 */
export const shimmer: EffectDef = {
  id: "shimmer",
  name: "Loading shimmer",
  blurb: "Sweeping highlight over the image while it loads.",
  kind: "loading",
  trigger: { type: "flag", flag: "loading" },
  requires: ["pseudo-after", "overflow-clip", "loading-state"],
  portability: "css",
  notes:
    "Drive the [data-loading] attribute (or an equivalent class) from your own " +
    "loading state. Base fill uses the theme's skeleton token, so it inverts " +
    "with light mode for free.",
  params: [
    {
      id: "speed",
      label: "Sweep",
      kind: "number",
      cssVar: "--fx-shimmer-speed",
      default: 1400,
      min: 400,
      max: 4000,
      step: 50,
      unit: "ms",
    },
    {
      id: "angle",
      label: "Angle",
      kind: "number",
      cssVar: "--fx-shimmer-angle",
      default: 105,
      min: 0,
      max: 180,
      step: 5,
      unit: "deg",
    },
    {
      id: "tint",
      label: "Highlight",
      kind: "color",
      cssVar: "--fx-shimmer-tint",
      default: "rgb(255 255 255 / 0.16)",
      tokens: [
        { value: "rgb(255 255 255 / 0.16)", label: "Soft white" },
        { value: "var(--accent-lime)", label: "Lime" },
        { value: "var(--surface-elevated)", label: "Elevated" },
      ],
    },
    {
      id: "base",
      label: "Base fill",
      kind: "color",
      cssVar: "--fx-shimmer-base",
      default: "var(--surface-skeleton)",
      tokens: [
        { value: "var(--surface-skeleton)", label: "Skeleton (themed)" },
        { value: "var(--surface-rail)", label: "Rail" },
        { value: "var(--surface-card)", label: "Card" },
      ],
    },
  ],
  css: (v) => ({
    keyframes: {
      sweep: `0% { background-position: -150% 0, 0 0; }
  100% { background-position: 250% 0, 0 0; }`,
    },
    animation: {
      name: "sweep",
      shorthand: `${v("speed")} linear infinite`,
      on: "after",
    },
    layers: {
      after: {
        content: '""',
        position: "absolute",
        inset: "0",
        "pointer-events": "none",
        "z-index": "2",
        background: `linear-gradient(${v("angle")}, transparent 35%, ${v("tint")} 50%, transparent 65%), ${v("base")}`,
        "background-size": "200% 100%, 100% 100%",
        "background-repeat": "no-repeat",
      },
    },
  }),
};
