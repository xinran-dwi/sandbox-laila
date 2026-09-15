"use client";

import { DEFAULT_STATE, type Theme } from "./protocol";

/**
 * Theme preference, stored in localStorage and read through
 * `useSyncExternalStore`.
 *
 * This is a store rather than `useState` + two effects on purpose. The effect
 * version has a real bug in it: an effect keyed on the theme also fires on
 * mount, so it saves the default over the value you are in the middle of
 * restoring, and the preference silently never survives a reload. Making the
 * storage itself the source of truth removes the ordering question entirely.
 */

const KEY = "sandbox.theme.v1";

const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const saved = window.localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : DEFAULT_STATE.theme;
  } catch {
    // Private mode, or storage disabled. The sandbox still works, it just
    // won't remember.
    return DEFAULT_STATE.theme;
  }
}

/** Cached so getSnapshot returns a stable value between writes. */
let snapshot: Theme | null = null;

export function getTheme(): Theme {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

/** The server has no storage; render the default and let the client correct it. */
export function getServerTheme(): Theme {
  return DEFAULT_STATE.theme;
}

export function setTheme(next: Theme) {
  snapshot = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // Non-fatal: keep the in-memory value so the session still works.
  }
  listeners.forEach((l) => l());
}

export function subscribeTheme(onChange: () => void) {
  listeners.add(onChange);
  // Another tab changing the preference should move this one too.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    snapshot = null;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}
