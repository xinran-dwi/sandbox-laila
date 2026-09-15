"use client";

import { Play, RotateCcw } from "lucide-react";
import { effectsFor, findEffect } from "@/lib/sandbox/effects";
import type { Selection } from "@/lib/sandbox/storage";
import { targetsFor } from "@/lib/sandbox/targets";
import { defaultValues } from "@/lib/sandbox/types";
import type { Viewport } from "./DeviceFrame";
import { ExportPanel } from "./ExportPanel";
import { ParamControl } from "./ParamControl";

const KIND_LABEL: Record<string, string> = {
  states: "States",
  emphasis: "Emphasis",
  loading: "Loading",
  celebration: "Celebration",
};

export function InteractionPanel({
  screen,
  viewport,
  selection,
  onSelect,
  foundTargets,
  loading,
  onLoadingChange,
  onReplay,
}: {
  screen: string;
  viewport: Viewport;
  selection: Selection;
  onSelect: (next: Selection) => void;
  /** Targets the preview actually reported; anything else is stale registry. */
  foundTargets: string[];
  loading: boolean;
  onLoadingChange: (on: boolean) => void;
  onReplay: () => void;
}) {
  const available = targetsFor(screen, viewport);
  const target = available.find((t) => t.id === selection.targetId) ?? null;
  const effect = selection.effectId ? findEffect(selection.effectId) : null;
  const offered = target ? effectsFor(target) : [];

  const pickTarget = (id: string) => {
    const next = available.find((t) => t.id === id);
    if (!next) return;
    const stillValid = effect && effectsFor(next).some((e) => e.id === effect.id);
    onSelect({
      targetId: id,
      effectId: stillValid ? effect.id : null,
      values: stillValid ? selection.values : {},
    });
  };

  const pickEffect = (id: string) => {
    const next = findEffect(id);
    if (!next) return;
    onSelect({ ...selection, effectId: id, values: defaultValues(next) });
  };

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-white/10 bg-[#101119]">
      <div className="border-b border-white/10 px-3 py-2.5">
        <h2 className="text-[12px] font-medium text-white">Motion</h2>
        <p className="mt-0.5 text-[10px] text-white/35">
          Preview only — your screen code is never edited.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-white/10 px-3 py-3">
          <span className="mb-1.5 block text-[10px] uppercase tracking-wide text-white/35">
            Target
          </span>
          <select
            value={selection.targetId ?? ""}
            onChange={(e) => pickTarget(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/[0.06] px-2 py-1.5 text-[12px] text-white"
          >
            <option value="" className="bg-[#15161d]">
              Choose an element…
            </option>
            {available.map((t) => {
              // The registry is only an index of attributes that live in
              // source. If the preview didn't report it, the attribute is gone.
              const missing = foundTargets.length > 0 && !foundTargets.includes(t.id);
              return (
                <option
                  key={t.id}
                  value={t.id}
                  disabled={missing}
                  className="bg-[#15161d]"
                >
                  {t.label}
                  {missing ? " — not found" : ""}
                </option>
              );
            })}
          </select>
        </section>

        {target && (
          <section className="border-b border-white/10 px-3 py-3">
            <span className="mb-1.5 block text-[10px] uppercase tracking-wide text-white/35">
              Effect
            </span>
            <div className="space-y-1">
              {offered.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => pickEffect(e.id)}
                  className={[
                    "w-full rounded-lg border px-2.5 py-2 text-left transition-colors",
                    e.id === selection.effectId
                      ? "border-lime/40 bg-lime/[0.08]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-[12px] text-white">{e.name}</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-px text-[9px] text-white/50">
                      {KIND_LABEL[e.kind] ?? e.kind}
                    </span>
                    {e.portability === "css+js" && (
                      <span className="rounded-full bg-amber-400/15 px-1.5 py-px text-[9px] text-amber-200/80">
                        +JS
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-white/40">
                    {e.blurb}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {effect && target && (
          <section className="space-y-3 px-3 py-3">
            {effect.trigger.type === "manual" && (
              <button
                type="button"
                onClick={onReplay}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-white/[0.1] py-1.5 text-[11px] text-white transition-colors hover:bg-white/[0.16]"
              >
                <Play className="size-3" /> Replay
              </button>
            )}

            {effect.trigger.type === "flag" && (
              <button
                type="button"
                onClick={() => onLoadingChange(!loading)}
                className={[
                  "flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] transition-colors",
                  loading
                    ? "bg-lime text-lime-ink"
                    : "bg-white/[0.1] text-white hover:bg-white/[0.16]",
                ].join(" ")}
              >
                <RotateCcw className="size-3" />
                {loading ? "Loading — on" : "Simulate loading"}
              </button>
            )}

            {effect.trigger.type === "event" && (
              <p className="rounded-md bg-white/[0.04] px-2 py-1.5 text-[10px] leading-snug text-white/45">
                Click the {target.label.toLowerCase()} in the preview to fire it.
              </p>
            )}

            {effect.trigger.type === "hover" && viewport === "mobile" && (
              <p className="rounded-md bg-amber-400/10 px-2 py-1.5 text-[10px] leading-snug text-amber-200/70">
                The frame reports hover support even at phone width. This won&apos;t
                run on a real device.
              </p>
            )}

            {effect.params.map((p) => (
              <ParamControl
                key={p.id}
                param={p}
                value={selection.values[p.id] ?? p.default}
                onChange={(next) =>
                  onSelect({
                    ...selection,
                    values: { ...selection.values, [p.id]: next },
                  })
                }
              />
            ))}
          </section>
        )}
      </div>

      {effect && target && (
        <ExportPanel effect={effect} values={selection.values} target={target} />
      )}
    </aside>
  );
}
