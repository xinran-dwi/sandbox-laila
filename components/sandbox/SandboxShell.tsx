"use client";

import {
  Monitor,
  Moon,
  Smartphone,
  SquareArrowOutUpRight,
  Sun,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  getServerTheme,
  getTheme,
  setTheme,
  subscribeTheme,
} from "@/lib/sandbox/themeStore";
import { DeviceFrame, type Viewport } from "./DeviceFrame";
import { useSandboxBridge } from "./useSandboxBridge";

const screens = [{ id: "image-detail", label: "Image Detail" }];

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors",
        active
          ? "bg-white/[0.14] text-white"
          : "text-white/55 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Segmented({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/[0.06] p-1">
      {children}
    </div>
  );
}

export function SandboxShell({ screen }: { screen: string }) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const src = `/preview/${screen}`;
  const label = screens.find((s) => s.id === screen)?.label ?? screen;

  // The shell owns the state; the preview is a dumb applier that re-syncs on
  // every mount. One writer, one source of truth.
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);

  // Stable identity, or the bridge rebinds its listener every render.
  const state = useMemo(() => ({ theme }), [theme]);
  const { frameRef, onFrameLoad, resetFrame } = useSandboxBridge(state);

  return (
    <div className="flex h-dvh flex-col bg-[#15161d]">
      <header className="flex shrink-0 items-center gap-4 border-b border-white/10 px-4 py-2.5">
        <span className="text-[13px] font-medium text-white">{label}</span>

        <Segmented>
          <ToolbarButton
            active={viewport === "desktop"}
            onClick={() => setViewport("desktop")}
          >
            <Monitor className="size-3.5" strokeWidth={1.8} />
            Desktop
          </ToolbarButton>
          <ToolbarButton
            active={viewport === "mobile"}
            onClick={() => setViewport("mobile")}
          >
            <Smartphone className="size-3.5" strokeWidth={1.8} />
            Mobile
          </ToolbarButton>
        </Segmented>

        <span className="text-[11px] text-white/35">
          {viewport === "desktop" ? "1440 × 931" : "390 × 844"}
        </span>

        <Segmented>
          <ToolbarButton
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
          >
            <Moon className="size-3.5" strokeWidth={1.8} />
            Dark
          </ToolbarButton>
          <ToolbarButton
            active={theme === "light"}
            onClick={() => setTheme("light")}
          >
            <Sun className="size-3.5" strokeWidth={1.8} />
            Light
          </ToolbarButton>
        </Segmented>

        {/* Seam for the next milestone: the motion panel lands here. */}
        <div className="ml-auto flex items-center gap-3">
          <span className="rounded-full border border-dashed border-white/15 px-2.5 py-1 text-[11px] text-white/30">
            interactions — next
          </span>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[12px] text-white/60 transition-colors hover:text-white"
          >
            <SquareArrowOutUpRight className="size-3.5" strokeWidth={1.8} />
            Open raw
          </a>
        </div>
      </header>

      <DeviceFrame
        src={src}
        viewport={viewport}
        frameRef={frameRef}
        onLoad={onFrameLoad}
        onRemount={resetFrame}
      />
    </div>
  );
}
