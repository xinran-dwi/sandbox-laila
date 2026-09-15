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

/** Everything the shell controls about the previewed screen. */
export type SandboxState = {
  theme: Theme;
};

export const DEFAULT_STATE: SandboxState = { theme: "dark" };

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
