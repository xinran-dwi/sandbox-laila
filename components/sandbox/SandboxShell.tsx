"use client";

import {
  Monitor,
  Moon,
  Smartphone,
  SquareArrowOutUpRight,
  Sun,
} from "lucide-react";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { kfName, renderPreview } from "@/lib/sandbox/css";
import { findEffect } from "@/lib/sandbox/effects";
import type { BurstConfig, SandboxState } from "@/lib/sandbox/protocol";
import {
  getSelection,
  getServerSelection,
  setSelection,
  subscribeSelection,
  type Selection,
} from "@/lib/sandbox/storage";
import { findTarget } from "@/lib/sandbox/targets";
import {
  getServerTheme,
  getTheme,
  setTheme,
  subscribeTheme,
} from "@/lib/sandbox/themeStore";
import { formatValue } from "@/lib/sandbox/types";
import { DeviceFrame, type Viewport } from "./DeviceFrame";
import { InteractionPanel } from "./InteractionPanel";
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
  const [loading, setLoading] = useState(false);
  const [play, setPlay] = useState(0);

  const src = `/preview/${screen}`;
  const label = screens.find((s) => s.id === screen)?.label ?? screen;

  // The shell owns the state; the preview is a dumb applier that re-syncs on
  // every mount. One writer, one source of truth.
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);

  const selection = useSyncExternalStore(
    subscribeSelection,
    () => getSelection(screen),
    getServerSelection,
  );

  const chooseSelection = useCallback(
    (next: Selection) => setSelection(screen, next),
    [screen],
  );

  const effect = selection.effectId ? findEffect(selection.effectId) : null;
  const target = selection.targetId ? findTarget(selection.targetId) : null;

  // The preview is rendered by the SAME function the export button calls, so
  // what you see and what you copy cannot disagree.
  const css = useMemo(() => {
    if (!effect || !target) return "";
    return renderPreview(effect, selection.values, target.id);
  }, [effect, target, selection.values]);

  const burst = useMemo<BurstConfig | null>(() => {
    if (!effect || !target || effect.trigger.type !== "event") return null;
    const read = (id: string, fallback: number) => {
      const v = selection.values[id];
      return typeof v === "number" ? v : fallback;
    };
    const paletteParam = effect.params.find((p) => p.id === "palette");
    const palette = paletteParam
      ? formatValue(paletteParam, selection.values.palette ?? paletteParam.default)
      : "";
    return {
      targetId: target.id,
      keyframe: kfName(effect.id, "fly"),
      count: read("count", 18),
      distance: read("distance", 90),
      size: read("size", 7),
      duration: read("duration", 900),
      colors: palette.split(",").map((c) => c.trim()).filter(Boolean),
      when: effect.trigger.when,
    };
  }, [effect, target, selection.values]);

  const state = useMemo<SandboxState>(
    () => ({
      theme,
      css,
      targetId: target?.id ?? null,
      flags: loading ? ["loading"] : [],
      play,
      burst,
    }),
    [theme, css, target, loading, play, burst],
  );

  const { frameRef, foundTargets, onFrameLoad, resetFrame } =
    useSandboxBridge(state);

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
          <ToolbarButton active={theme === "dark"} onClick={() => setTheme("dark")}>
            <Moon className="size-3.5" strokeWidth={1.8} />
            Dark
          </ToolbarButton>
          <ToolbarButton active={theme === "light"} onClick={() => setTheme("light")}>
            <Sun className="size-3.5" strokeWidth={1.8} />
            Light
          </ToolbarButton>
        </Segmented>

        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1.5 text-[12px] text-white/60 transition-colors hover:text-white"
        >
          <SquareArrowOutUpRight className="size-3.5" strokeWidth={1.8} />
          Open raw
        </a>
      </header>

      <div className="flex min-h-0 flex-1">
        <DeviceFrame
          src={src}
          viewport={viewport}
          frameRef={frameRef}
          onLoad={onFrameLoad}
          onRemount={resetFrame}
        />
        <InteractionPanel
          screen={screen}
          viewport={viewport}
          selection={selection}
          onSelect={chooseSelection}
          foundTargets={foundTargets}
          loading={loading}
          onLoadingChange={setLoading}
          onReplay={() => setPlay((n) => n + 1)}
        />
      </div>
    </div>
  );
}
