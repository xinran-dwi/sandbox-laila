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
  /** Emitted as a comment in the export. */
  notes?: string;
};

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
