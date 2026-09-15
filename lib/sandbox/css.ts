import {
  formatValue,
  type CssPayload,
  type Decls,
  type EffectDef,
  type EffectTrigger,
  type ParamValues,
} from "./types";

/**
 * One payload, three renderers.
 *
 * They differ in exactly one thing: how the selector is spelled. Keyframe
 * bodies, declarations, the animation shorthand, the hover guard and the
 * reduced-motion fallback are shared code paths — so the live preview and the
 * exported snippet cannot drift apart, because they are the same function.
 */

/** Keyframe names are namespaced so injected CSS can't collide with the page. */
const NS = "sbx";

function kfName(effectId: string, name: string) {
  return `${NS}-${effectId}-${name}`;
}

function declsToCss(decls: Decls, indent = "  "): string {
  return Object.entries(decls)
    .map(([prop, value]) => `${indent}${prop}: ${value};`)
    .join("\n");
}

/** `v("duration")` -> `var(--fx-pop-duration, 320ms)`. */
function reader(effect: EffectDef) {
  return (paramId: string) => {
    const param = effect.params.find((p) => p.id === paramId);
    if (!param) throw new Error(`${effect.id}: unknown param "${paramId}"`);
    return `var(${param.cssVar}, ${formatValue(param, param.default)})`;
  };
}

/** The tuned values, as custom properties to sit in the base rule. */
function tunedVars(effect: EffectDef, values: ParamValues): Decls {
  const out: Decls = {};
  for (const param of effect.params) {
    const value = values[param.id];
    if (value === undefined) continue;
    out[param.cssVar] = formatValue(param, value);
  }
  return out;
}

/**
 * Where the animation binds. This is the only place a trigger turns into a
 * selector, which is why `trigger` can stay an open enum without every effect
 * needing to know about it.
 *
 * Preview and export differ here, and only here. The preview is driven by
 * sandbox-internal attributes, which must NEVER reach exported code — a dev
 * pasting `[data-sandbox-play]` would get an animation that never runs. The
 * export uses the plain conventions the effect's notes describe instead.
 */
function triggerSuffix(
  trigger: EffectTrigger,
  mode: "preview" | "export",
): string | null {
  switch (trigger.type) {
    case "hover":
      return ":hover";
    case "press":
      return ":active";
    case "manual":
      // Applying the class is itself the trigger in exported code.
      return mode === "preview" ? "[data-sandbox-play]" : "";
    case "flag":
      return mode === "preview"
        ? `[data-sandbox-flag~="${trigger.flag}"]`
        : `[data-${trigger.flag}]`;
    case "event":
      // Driven by JS against elements the runtime creates, not the target.
      return null;
  }
}

type RenderOptions = {
  /** How the target is addressed. */
  selector: string;
  /** Include the tuned values as custom properties (preview + portable). */
  inlineValues: boolean;
  mode: "preview" | "export";
};

function renderRules(
  effect: EffectDef,
  values: ParamValues,
  { selector, inlineValues, mode }: RenderOptions,
): string {
  const payload: CssPayload = effect.css(reader(effect));
  const out: string[] = [];

  for (const [name, body] of Object.entries(payload.keyframes ?? {})) {
    out.push(`@keyframes ${kfName(effect.id, name)} {\n  ${body.trim()}\n}`);
  }

  const base: Decls = {
    ...(inlineValues ? tunedVars(effect, values) : {}),
    ...(payload.base ?? {}),
  };
  if (Object.keys(base).length) {
    out.push(`${selector} {\n${declsToCss(base)}\n}`);
  }

  const suffix = triggerSuffix(effect.trigger, mode);

  // Overlays are gated on the trigger along with the animation. A loading
  // shimmer emitted at the bare selector would paint over the image forever.
  for (const [layer, decls] of Object.entries(payload.layers ?? {})) {
    if (!decls) continue;
    out.push(`${selector}${suffix ?? ""}::${layer} {\n${declsToCss(decls)}\n}`);
  }

  for (const [state, decls] of Object.entries(payload.states ?? {})) {
    if (!decls) continue;
    const rule = `${selector}:${state} {\n${declsToCss(decls)}\n}`;
    // A framed preview reports desktop hover capability even at 390px wide, so
    // an unguarded hover rule "works" in mobile preview and does nothing on a
    // real phone. Guard it here rather than trusting every effect to remember.
    out.push(state === "hover" ? `@media (hover: hover) {\n${rule}\n}` : rule);
  }

  if (payload.animation) {
    const { name, shorthand, on = "self" } = payload.animation;
    if (suffix !== null) {
      const el = on === "after" ? `${selector}${suffix}::after` : `${selector}${suffix}`;
      out.push(`${el} {\n  animation: ${kfName(effect.id, name)} ${shorthand};\n}`);
    }
  }

  const reduced = Array.from(
    new Set([
      selector,
      payload.animation?.on === "after" ? `${selector}::after` : selector,
    ]),
  ).join(", ");
  out.push(
    `@media (prefers-reduced-motion: reduce) {\n  ${reduced} {\n    animation: none;\n    transition: none;\n  }\n}`,
  );

  return out.join("\n\n");
}

/** What gets injected into the preview frame. */
export function renderPreview(
  effect: EffectDef,
  values: ParamValues,
  targetId: string,
): string {
  return renderRules(effect, values, {
    selector: `[data-sandbox-target="${targetId}"]`,
    inlineValues: true,
    mode: "preview",
  });
}

/** Copy-paste CSS for any stack. */
export function renderPortable(
  effect: EffectDef,
  values: ParamValues,
  className = `fx-${effect.id}`,
): string {
  const header = [
    `/* ${effect.name} — ${effect.blurb}`,
    effect.notes ? ` * ${effect.notes}` : null,
    ` * Apply .${className} to the element. */`,
  ]
    .filter(Boolean)
    .join("\n");

  return `${header}\n\n${renderRules(effect, values, {
    selector: `.${className}`,
    inlineValues: true,
    mode: "export",
  })}`;
}

/**
 * Tailwind v4. Two halves: a CONSTANT @theme block (the keyframes reference
 * var() with the defaults baked in, so tuning never changes it), and a class
 * string carrying the tuned values as arbitrary properties.
 */
export function renderTailwind(
  effect: EffectDef,
  values: ParamValues,
): { theme: string; classes: string } {
  const payload = effect.css(reader(effect));
  const lines: string[] = [];

  lines.push("/* app/globals.css — a PLAIN @theme block.");
  lines.push(" * NOT this repo's `@theme inline`: inline substitutes values at");
  lines.push(" * the use site, which is wrong for --animate-*.");
  lines.push(" *");
  lines.push(" * Note Tailwind v4's duration-* sets transition-duration, NOT");
  lines.push(" * animation-duration — tune via the custom property below. */");
  lines.push("@theme {");

  if (payload.animation) {
    const { name, shorthand } = payload.animation;
    lines.push(
      `  --animate-${kfName(effect.id, name)}: ${kfName(effect.id, name)} ${shorthand};`,
    );
  }
  for (const [name, body] of Object.entries(payload.keyframes ?? {})) {
    lines.push(`  @keyframes ${kfName(effect.id, name)} {`);
    lines.push(`    ${body.trim()}`);
    lines.push("  }");
  }
  lines.push("}");

  const classes: string[] = [];

  // Tuned values as arbitrary properties: total coverage, no mapping table.
  for (const [prop, value] of Object.entries(tunedVars(effect, values))) {
    classes.push(`[${prop}:${value.replace(/\s+/g, "_")}]`);
  }

  if (payload.animation) {
    const anim = `animate-${kfName(effect.id, payload.animation.name)}`;
    const suffix = triggerSuffix(effect.trigger, "export");
    if (suffix === ":hover") classes.push(`hover:${anim}`);
    else if (suffix === ":active") classes.push(`active:${anim}`);
    else if (suffix !== null) classes.push(anim);
  }

  for (const [prop, value] of Object.entries(payload.base ?? {})) {
    if (prop.startsWith("--")) continue;
    classes.push(`[${prop}:${value.replace(/\s+/g, "_")}]`);
  }

  for (const [state, decls] of Object.entries(payload.states ?? {})) {
    if (!decls) continue;
    const variant = state === "focus-visible" ? "focus-visible" : state;
    for (const [prop, value] of Object.entries(decls)) {
      classes.push(`${variant}:[${prop}:${value.replace(/\s+/g, "_")}]`);
    }
  }

  return { theme: lines.join("\n"), classes: classes.join(" ") };
}

export { kfName };
