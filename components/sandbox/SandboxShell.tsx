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
import type { ParticleConfig, SandboxState } from "@/lib/sandbox/protocol";
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
import { formatValue, tunedVarsFor } from "@/lib/sandbox/types";
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

  // Built from the effect's own particle spec rather than by guessing param
  // names, so a new particle effect needs no change here.
  const burst = useMemo<ParticleConfig | null>(() => {
    const spec = effect?.particles;
    if (!effect || !target || !spec || effect.trigger.type !== "event") return null;

    const num = (paramId: string | undefined, fallback: number) => {
      if (!paramId) return fallback;
      const param = effect.params.find((p) => p.id === paramId);
      const value = selection.values[paramId] ?? param?.default;
      return typeof value === "number" ? value : fallback;
    };

    const colorParam = effect.params.find((p) => p.id === spec.colorParam);
    const colors = colorParam
      ? formatValue(
          colorParam,
          selection.values[spec.colorParam] ?? colorParam.default,
        )
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    return {
      targetId: target.id,
      effectId: effect.id,
      keyframe: kfName(effect.id, spec.keyframe),
      count: num(spec.countParam, 16),
      size: num(spec.sizeParam, 7),
      duration: num("duration", 900),
      easing: (() => {
        const p = spec.easingParam
          ? effect.params.find((x) => x.id === spec.easingParam)
          : undefined;
        return p
          ? formatValue(p, selection.values[p.id] ?? p.default)
          : spec.easing;
      })(),
      stagger: num(spec.staggerParam, 0),
      colors,
      glyph: spec.glyph,
      values: selection.values,
      // Particles live outside the target's subtree, so they inherit nothing
      // from it. Without this every keyframe-resident param is a dead slider.
      vars: tunedVarsFor(effect, selection.values),
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
