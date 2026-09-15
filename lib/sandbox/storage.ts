"use client";

import type { ParamValues } from "./types";

/**
 * Panel selection, persisted so an exploration session survives a reload.
 * Parent-side only — the preview stays stateless, which is what keeps the
 * snapshot model honest.
 *
 * Read through `useSyncExternalStore` rather than a useState initializer.
 * Reading storage during render looks simpler and isn't: the server has no
 * storage, so the first client render disagrees with the SSR'd HTML and React
 * throws a hydration mismatch. A store has a separate server snapshot, which
 * is the sanctioned way to say "this value only exists on the client".
 */

export type Selection = {
  targetId: string | null;
  effectId: string | null;
  values: ParamValues;
};

export const EMPTY_SELECTION: Selection = {
  targetId: null,
  effectId: null,
  values: {},
};

const key = (screen: string) => `sandbox.fx.v1.${screen}`;

const listeners = new Set<() => void>();
/** getSnapshot must return a stable reference or React re-renders forever. */
const cache = new Map<string, Selection>();

function read(screen: string): Selection {
  try {
    const raw = window.localStorage.getItem(key(screen));
    if (!raw) return EMPTY_SELECTION;
    const parsed = JSON.parse(raw) as Selection;
    if (typeof parsed !== "object" || parsed === null) return EMPTY_SELECTION;
    return {
      targetId: parsed.targetId ?? null,
      effectId: parsed.effectId ?? null,
      values: parsed.values ?? {},
    };
  } catch {
    return EMPTY_SELECTION;
  }
}

export function getSelection(screen: string): Selection {
  const hit = cache.get(screen);
  if (hit) return hit;
  const value = read(screen);
  cache.set(screen, value);
  return value;
}

export function getServerSelection(): Selection {
  return EMPTY_SELECTION;
}

export function setSelection(screen: string, next: Selection) {
  cache.set(screen, next);
  try {
    window.localStorage.setItem(key(screen), JSON.stringify(next));
  } catch {
    // Storage blocked; keep the in-memory value so the session still works.
  }
  listeners.forEach((l) => l());
}

export function subscribeSelection(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}
