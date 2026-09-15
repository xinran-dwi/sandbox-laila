import type { EffectDef, TargetDef } from "../types";
import { burst } from "./burst";
import { pop } from "./pop";
import { press } from "./press";
import { shimmer } from "./shimmer";
import { spiral } from "./spiral";

/**
 * The registry. Adding effect #20 means importing it and appending it here —
 * the panel renders its controls from the param schema and needs no changes.
 */
export const effects: EffectDef[] = [press, pop, shimmer, burst, spiral];

export function findEffect(id: string) {
  return effects.find((e) => e.id === id) ?? null;
}

/** An effect is offered only where the target can actually support it. */
export function effectsFor(target: TargetDef) {
  return effects.filter((e) =>
    e.requires.every((c) => target.capabilities.includes(c)),
  );
}
