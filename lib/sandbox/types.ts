/**
 * The vocabulary the motion lab is built from.
 *
 * The whole point of this file is that adding an effect is a DATA change. An
 * effect declares a typed parameter schema and returns a structured payload;
 * the panel renders its controls from the schema and never learns what any
 * individual effect is, and three renderers in `css.ts` turn one payload into
 * preview CSS, portable CSS and Tailwind.
 *
 * Two rules keep that honest:
 *
 *  1. An effect writes DECLARATIONS, never selectors. Selectors, hover guards,
 *     reduced-motion fallbacks and keyframe name prefixing are added by the
 *     renderers, so an effect physically cannot hardcode a sandbox attribute.
 *  2. Every tunable value is emitted as a CSS custom property and referenced
 *     through var(). That makes the keyframe body CONSTANT — dragging a slider
 *     never recompiles it — which is what lets the exported @theme block stay
 *     fixed while tuning is expressed as plain utilities.
 */

/** What an element must support before an effect can be offered for it. */
export type Capability =
  | "transform"
  | "pseudo-after"
  | "overflow-clip"
  | "click"
  | "loading-state";

export type TargetKind = "button" | "icon" | "image" | "card";

export type TargetDef = {
  /** Matches the element's data-sandbox-target attribute. */
  id: string;
  label: string;
  screen: string;
  /**
   * The screen renders its mobile and desktop trees at the same time, so a
   * shared id would match two elements, one of them invisible. Every target is
   * variant-unique and the panel filters by the current viewport.
   */
  variant: "mobile" | "desktop";
  kind: TargetKind;
  /** Quoted in the export so an engineer can find the real component. */
  file: string;
  capabilities: Capability[];
  cardinality: "one" | "many";
};

/* -------------------------------------------------------------------------- */
/* Parameters                                                                  */
/* -------------------------------------------------------------------------- */

type BaseParam<K extends string, V> = {
  id: string;
  label: string;
  kind: K;
  default: V;
  /** The custom property this param is emitted as. See rule 2 above. */
  cssVar: `--${string}`;
  help?: string;
};

export type NumberParam = BaseParam<"number", number> & {
  min: number;
  max: number;
  step: number;
  unit?: "ms" | "px" | "deg" | "%" | "";
};

export type SelectParam = BaseParam<"select", string> & {
  options: { value: string; label: string; css: string }[];
};

export type ColorParam = BaseParam<"color", string> & {
  /** Design tokens offered before a raw color. */
  tokens?: { value: string; label: string }[];
};

export type EffectParam = NumberParam | SelectParam | ColorParam;
export type ParamValues = Record<string, string | number>;

/* -------------------------------------------------------------------------- */
/* Payload                                                                     */
/* -------------------------------------------------------------------------- */

export type Decls = Record<string, string>;

export type CssPayload = {
  /** Unprefixed name -> keyframe body. The renderers namespace the name. */
  keyframes?: Record<string, string>;
  animation?: {
    name: string;
    /** Everything after the name: duration, easing, fill, iteration count. */
    shorthand: string;
    /** Whether the animation runs on the element or on its ::after layer. */
    on?: "self" | "after";
  };
  base?: Decls;
  states?: Partial<Record<"hover" | "active" | "focus-visible", Decls>>;
  /** Overlays, so an effect can paint over an element with no DOM insertion. */
  layers?: Partial<Record<"after" | "before", Decls>>;
};

/* -------------------------------------------------------------------------- */
/* Effects                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A browsing category for the panel's list. Deliberately carries NO behavior —
 * the mechanism lives in `trigger`. Keeping them separate is what makes "the
 * same effect, but on hover instead of press" a dropdown rather than a second
 * effect file.
 */
export type EffectKind =
  | "states"
  | "emphasis"
  | "loading"
  | "celebration";

export type EffectTrigger =
  | { type: "hover" }
  | { type: "press" }
  /** Runs when the panel's Replay button is pressed. */
  | { type: "manual" }
  /** Runs while a simulated flag is set on the target. */
  | { type: "flag"; flag: string }
  /** Needs real JS in the frame; see runtimes/. */
  | { type: "event"; dom: "click"; when?: { attr: string; equals: string } };

/**
 * Shown as a badge in the panel. A property of the effect, not a category —
 * the designer should see the cost of an effect up front, given the whole
 * point of the export is portability.
 */
export type Portability = "css" | "css+js";

/**
 * How an event-triggered effect spawns particles.
 *
 * The runtime knows how to create, colour, stagger and clean up elements. It
 * does NOT know where they go — `place` owns that, so a new particle effect is
 * still a data change rather than new runtime code.
 */
export type ParticleSpec = {
  /** Unprefixed keyframe the particles run. */
  keyframe: string;
  /** Param ids the RUNTIME reads, as opposed to the ones the keyframe reads. */
  countParam: string;
  sizeParam: string;
  colorParam: string;
  staggerParam?: string;
  /**
   * The runtime sets animation-timing-function inline, which beats the
   * keyframe shorthand — so an effect that wants a tunable curve has to name
   * the param here or the slider would be silently overridden.
   */
  easingParam?: string;
  /** Used when `easingParam` is absent. */
  easing: string;
  /**
   * Each particle's own custom properties. Pure: index in, declarations out.
   * Burst places radially (--x/--y); the spiral places on a circle (--a0/--rad).
   */
  place: (
    i: number,
    n: number,
    values: ParamValues,
  ) => Record<string, string>;
  /**
   * Shown in the panel's JS tab. Hand-written, and deliberately kept next to
   * `place` — a runtime can't be mechanically turned into readable example
   * code, so this is the one spot that needs keeping in step by hand.
   *
   * Write `%KEYFRAME%` wherever the animation name goes; the panel substitutes
   * the real, namespaced name. Hardcoding it silently produces a snippet that
   * references an animation the CSS tab never defines.
   */
  exportSnippet: string;
};

export type EffectDef = {
  id: string;
  name: string;
  blurb: string;
  kind: EffectKind;
  trigger: EffectTrigger;
  requires: Capability[];
  portability: Portability;
  params: EffectParam[];
  /** `v("duration")` returns `var(--fx-…-duration, 320ms)`. */
  css: (v: (paramId: string) => string) => CssPayload;
  /** Required when `trigger.type === "event"`. */
  particles?: ParticleSpec;
  /** Emitted as a comment in the export. */
  notes?: string;
};

/**
 * The tuned values as custom properties. Needed twice: in the CSS rule on the
 * target, and on the particle layer — particles live on document.body, outside
 * the target's subtree, so they inherit nothing from it.
 */
export function tunedVarsFor(
  effect: EffectDef,
  values: ParamValues,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const param of effect.params) {
    const value = values[param.id];
    out[param.cssVar] = formatValue(param, value ?? param.default);
  }
  return out;
}

/** Appends the unit so `320` becomes `320ms` before it reaches CSS. */
export function formatValue(
  param: EffectParam,
  value: string | number,
): string {
  if (param.kind === "number") return `${value}${param.unit ?? ""}`;
  if (param.kind === "select") {
    const opt = param.options.find((o) => o.value === value);
    return opt ? opt.css : String(value);
  }
  return String(value);
}

export function defaultValues(effect: EffectDef): ParamValues {
  return Object.fromEntries(effect.params.map((p) => [p.id, p.default]));
}
