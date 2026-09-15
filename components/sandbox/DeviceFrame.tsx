"use client";

import { useEffect, useRef, useState, type Ref } from "react";

export type Viewport = "desktop" | "mobile";

const SIZES: Record<Viewport, { w: number; h: number }> = {
  desktop: { w: 1440, h: 931 },
  mobile: { w: 390, h: 844 },
};

/**
 * Renders the screen in an iframe at a true device width so the page's own
 * CSS media queries fire exactly as they would on a real device. Scales down
 * only when the sandbox window is too small to show it 1:1.
 */
export function DeviceFrame({
  src,
  viewport,
  frameRef,
  onLoad,
  onRemount,
}: {
  src: string;
  viewport: Viewport;
  /** Handed to the sandbox bridge so the shell can talk to the screen. */
  frameRef?: Ref<HTMLIFrameElement>;
  onLoad?: () => void;
  /** Switching viewport swaps the iframe for a fresh document. */
  onRemount?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { w, h } = SIZES[viewport];

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const fit = () => {
      const { width, height } = host.getBoundingClientRect();
      setScale(Math.min(1, width / w, height / h));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    return () => ro.disconnect();
  }, [w, h]);

  // Switching viewport swaps in a brand-new iframe document, so the parent's
  // view of the child is stale. `onRemount` is memoised by the caller.
  useEffect(() => {
    onRemount?.();
  }, [viewport, onRemount]);

  return (
    <div
      ref={hostRef}
      className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6"
    >
      <div
        style={{
          width: w * scale,
          height: h * scale,
        }}
        className="relative"
      >
        <iframe
          key={viewport}
          ref={frameRef}
          src={src}
          onLoad={onLoad}
          title={`${viewport} preview`}
          style={{
            width: w,
            height: h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className={[
            "absolute left-0 top-0 border-0 bg-page",
            viewport === "mobile"
              ? "rounded-[38px] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
              : "rounded-[10px] shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
