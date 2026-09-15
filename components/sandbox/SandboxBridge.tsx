"use client";

import { useEffect } from "react";
import {
  CHANNEL,
  PROTOCOL,
  parseParentMessage,
  type ChildMessage,
  type SandboxState,
} from "@/lib/sandbox/protocol";

/**
 * The preview side of the bridge. Renders nothing; it only applies whatever
 * the sandbox shell tells it to.
 *
 * Mounted from `app/preview/layout.tsx`, which also wraps "Open raw" — so the
 * `window.parent === window` bail-out is not optional. Opened directly, or
 * deployed for real, this component does nothing at all and `/preview/*` stays
 * the clean deliverable it is meant to be.
 */
export function SandboxBridge() {
  useEffect(() => {
    // Standalone, not framed by the sandbox. Do nothing.
    if (window.parent === window) return;

    const root = document.documentElement;
    /** Last snapshot received, so the observer below knows what to restore. */
    let current: SandboxState | null = null;

    const apply = (state: SandboxState) => {
      current = state;
      if (root.dataset.theme !== state.theme) root.dataset.theme = state.theme;
    };

    const announce = () => {
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-sandbox-target]"),
      )
        // A target in the hidden half of the responsive tree is present in the
        // DOM but has no boxes. getClientRects() catches that, and unlike
        // offsetParent it isn't also null for position:fixed.
        .filter((el) => el.getClientRects().length > 0)
        .map((el) => el.dataset.sandboxTarget)
        .filter((id): id is string => Boolean(id));

      const msg: ChildMessage = {
        channel: CHANNEL,
        t: "ready",
        v: PROTOCOL,
        targets: Array.from(new Set(targets)),
      };
      window.parent.postMessage(msg, window.location.origin);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const msg = parseParentMessage(event.data);
      if (!msg) return;
      if (msg.t === "hello") announce();
      else apply(msg.state);
    };

    window.addEventListener("message", onMessage);

    // `data-theme` is React-rendered in app/layout.tsx as a literal "dark", so
    // a Fast Refresh that remounts <html> silently reverts our write. Watching
    // the attribute is cheaper than reasoning about which edits trigger that.
    const observer = new MutationObserver(() => {
      if (current && root.dataset.theme !== current.theme) apply(current);
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    announce();

    return () => {
      window.removeEventListener("message", onMessage);
      observer.disconnect();
    };
  }, []);

  return null;
}
