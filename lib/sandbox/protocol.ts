/**
 * The wire between the sandbox shell and the previewed screen.
 *
 * They are separate documents (the shell renders the screen in a same-origin
 * iframe), so every instruction crosses a postMessage boundary. Both sides
 * import this file, so the contract has exactly one definition.
 *
 * Two rules keep it from desyncing:
 *
 *  1. Messages carry a FULL SNAPSHOT, never a delta. The child holds no
 *     authoritative state of its own, so it cannot drift out of step.
 *  2. The handshake is CHILD-INITIATED. The parent can't know when the child
 *     has hydrated — `iframe.onload` fires before React hydration — so the
 *     child announces itself on every mount and the parent replies with the
 *     current snapshot. That makes Fast Refresh, manual reload and viewport
 *     switching all self-healing without detecting any of them.
 */

export const PROTOCOL = 1;

/** Namespaced so we ignore postMessage traffic that isn't ours. */
export const CHANNEL = "sandbox-bridge";

export type Theme = "dark" | "light";

/**
 * An armed particle effect. Plain data only — the effect's `place` function
 * can't cross a structured clone, so the preview looks the effect up by id in
 * the shared registry and calls it there. Both frames run the same bundle.
 */
export type ParticleConfig = {
  targetId: string;
  /** Looked up in the effect registry on the preview side. */
  effectId: string;
  /** Prefixed keyframe name from the effect renderer. */
  keyframe: string;
  count: number;
  size: number;
  duration: number;
  easing: string;
  stagger: number;
  colors: string[];
  /** SVG markup each particle carries, when the effect declares one. */
  glyph?: string;
  /** Tuned param values, so the preview can run `place` with them. */
  values: Record<string, string | number>;
  /**
   * Tuned values as custom properties, applied to the particle LAYER. Particles
   * sit on document.body, outside the target's subtree, so without this every
   * keyframe-resident param silently falls back to its default.
   */
  vars: Record<string, string>;
  /** Only fire when the clicked element ends up in this state. */
  when?: { attr: string; equals: string };
};

/** Everything the shell controls about the previewed screen. */
export type SandboxState = {
  theme: Theme;
  /** Rendered effect CSS to inject, or "" for none. */
  css: string;
  /** The element the current effect applies to. */
  targetId: string | null;
  /** Simulated states set on that element, e.g. ["loading"]. */
  flags: string[];
  /** Bumped to replay a one-shot animation. */
  play: number;
  burst: ParticleConfig | null;
};

export const DEFAULT_STATE: SandboxState = {
  theme: "dark",
  css: "",
  targetId: null,
  flags: [],
  play: 0,
  burst: null,
};

export type ParentMessage =
  /** Belt-and-braces re-ask on iframe load; the child answers with `ready`. */
  | { channel: typeof CHANNEL; t: "hello"; v: number }
  | { channel: typeof CHANNEL; t: "state"; v: number; state: SandboxState };

export type ChildMessage = {
  channel: typeof CHANNEL;
  t: "ready";
  v: number;
  /**
   * The `data-sandbox-target` values actually present and laid out right now.
   * The shell greys out registry entries missing from this list, so an
   * attribute that gets renamed in a component surfaces as a disabled option
   * rather than a control that silently does nothing.
   */
  targets: string[];
};

function isOurs(data: unknown): data is { channel: string; t: string; v: number } {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { channel?: unknown }).channel === CHANNEL &&
    typeof (data as { t?: unknown }).t === "string"
  );
}

export function parseParentMessage(data: unknown): ParentMessage | null {
  if (!isOurs(data)) return null;
  if (data.t === "hello" || data.t === "state") return data as ParentMessage;
  return null;
}

export function parseChildMessage(data: unknown): ChildMessage | null {
  if (!isOurs(data)) return null;
  return data.t === "ready" ? (data as ChildMessage) : null;
}
