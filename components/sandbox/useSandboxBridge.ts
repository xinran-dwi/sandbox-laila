"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHANNEL,
  PROTOCOL,
  parseChildMessage,
  type ParentMessage,
  type SandboxState,
} from "@/lib/sandbox/protocol";

/**
 * The shell side of the bridge. Owns the authoritative state and re-sends the
 * whole snapshot every time the preview announces itself.
 *
 * That last part is what makes this robust: the preview remounts constantly
 * during a design session (Fast Refresh, viewport switch, manual reload) and
 * each remount ends in a `ready`, which we answer with the current state. We
 * never detect a reload — the handshake IS the recovery path.
 */
export function useSandboxBridge(state: SandboxState) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);
  const [foundTargets, setFoundTargets] = useState<string[]>([]);

  const post = useCallback((msg: ParentMessage) => {
    frameRef.current?.contentWindow?.postMessage(msg, window.location.origin);
  }, []);

  const sendState = useCallback(() => {
    post({ channel: CHANNEL, t: "state", v: PROTOCOL, state });
  }, [post, state]);

  // `state` must be a stable object across renders or this rebinds constantly —
  // callers memoise it.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const msg = parseChildMessage(event.data);
      if (!msg) return;
      setReady(true);
      setFoundTargets(msg.targets);
      sendState();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendState]);

  // Push on every state change. Harmless before the preview is listening — its
  // own `ready` will pull the current snapshot across regardless.
  useEffect(() => {
    sendState();
  }, [sendState]);

  /**
   * Called on iframe load. `load` fires BEFORE React hydrates inside the frame,
   * so this is not a readiness signal — it's a nudge asking the child to
   * re-announce, in case its `ready` was posted before we were listening.
   */
  const onFrameLoad = useCallback(() => {
    post({ channel: CHANNEL, t: "hello", v: PROTOCOL });
  }, [post]);

  // A remounted iframe (viewport switch) is a different document.
  const resetFrame = useCallback(() => {
    setReady(false);
    setFoundTargets([]);
  }, []);

  return { frameRef, ready, foundTargets, onFrameLoad, resetFrame };
}
