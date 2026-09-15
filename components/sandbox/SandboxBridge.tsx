"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  CHANNEL,
  DEFAULT_STATE,
  PROTOCOL,
  parseParentMessage,
  type ChildMessage,
  type SandboxState,
} from "@/lib/sandbox/protocol";
import { PARTICLE_ATTR, spawnBurst } from "@/lib/sandbox/runtimes/burst";

/**
 * The preview side of the bridge. Applies whatever the sandbox shell sends:
 * theme, effect CSS, simulated flags, replays, and armed confetti.
 *
 * Mounted from `app/preview/layout.tsx`, which also wraps "Open raw" — so the
 * `window.parent === window` bail-out is not optional. Opened directly, or
 * deployed for real, this does nothing at all and `/preview/*` stays the clean
 * deliverable it is meant to be.
 */
/** Whether we're inside the sandbox at all. Client-only, so it can't be read
 *  during render without diverging from the server — hence the store. */
const subscribeNoop = () => () => {};
const isFramed = () => window.parent !== window;
const isFramedOnServer = () => false;

export function SandboxBridge() {
  const framed = useSyncExternalStore(
    subscribeNoop,
    isFramed,
    isFramedOnServer,
  );
  const [state, setState] = useState<SandboxState>(DEFAULT_STATE);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!framed) return;

    const announce = () => {
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-sandbox-target]"),
      )
        // A target in the hidden half of the responsive tree is in the DOM but
        // has no boxes. getClientRects() catches that, and unlike offsetParent
        // it isn't also null for position:fixed.
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
      else setState(msg.state);
    };

    window.addEventListener("message", onMessage);
    announce();
    return () => window.removeEventListener("message", onMessage);
  }, [framed]);

  /* Theme ----------------------------------------------------------------- */
  useEffect(() => {
    if (!framed) return;
    const root = document.documentElement;
    const apply = () => {
      if (root.dataset.theme !== stateRef.current.theme) {
        root.dataset.theme = stateRef.current.theme;
      }
    };
    apply();

    // `data-theme` is React-rendered in app/layout.tsx as a literal "dark", so
    // a Fast Refresh that remounts <html> silently reverts our write.
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [framed, state.theme]);

  /* Simulated flags ------------------------------------------------------- */
  useEffect(() => {
    if (!framed || !state.targetId) return;
    const el = document.querySelector<HTMLElement>(
      `[data-sandbox-target="${state.targetId}"]`,
    );
    if (!el) return;

    if (state.flags.length) el.dataset.sandboxFlag = state.flags.join(" ");
    else delete el.dataset.sandboxFlag;

    return () => {
      delete el.dataset.sandboxFlag;
    };
  }, [framed, state.targetId, state.flags]);

  /* Replay ---------------------------------------------------------------- */
  useEffect(() => {
    if (!framed || !state.play || !state.targetId) return;
    const els = document.querySelectorAll<HTMLElement>(
      `[data-sandbox-target="${state.targetId}"]`,
    );
    els.forEach((el) => {
      el.dataset.sandboxPlay = "";
      // Restarting via getAnimations avoids the animation:none + forced-reflow
      // hack, and correctly restarts every animation on the element at once.
      requestAnimationFrame(() => {
        el.getAnimations({ subtree: true }).forEach((a) => {
          a.cancel();
          a.play();
        });
      });
    });
  }, [framed, state.play, state.targetId]);

  /* Confetti -------------------------------------------------------------- */
  useEffect(() => {
    if (!framed) return;
    const burst = state.burst;
    if (!burst) return;

    const layer = document.createElement("div");
    layer.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    document.body.append(layer);

    // One capture-phase listener. By click time the target is just DOM, so it
    // makes no difference whether a server or client component rendered it.
    // Never call preventDefault/stopPropagation here — React's own delegated
    // handlers still need the event.
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>(
        `[data-sandbox-target="${burst.targetId}"]`,
      );
      if (!el) return;

      const fire = () => {
        const box = el.getBoundingClientRect();
        spawnBurst(document, layer, {
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        }, burst);
      };

      // Wait a frame so React's state update has committed before reading the
      // attribute — that's how "on thumbs-up but not un-thumbs-up" works.
      if (burst.when) {
        requestAnimationFrame(() => {
          if (el.getAttribute(burst.when!.attr) === burst.when!.equals) fire();
        });
      } else {
        fire();
      }
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      layer.remove();
    };
  }, [framed, state.burst]);

  if (!framed) return null;

  // A portal, not React 19's <style href precedence> hoisting: that path
  // dedupes and caches by href and will not track content changes.
  return createPortal(
    <style data-sandbox-css="">{`${state.css}\n[${PARTICLE_ATTR}]{position:absolute;pointer-events:none}`}</style>,
    document.head,
  );
}
