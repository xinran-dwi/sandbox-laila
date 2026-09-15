"use client";

import type { EffectParam } from "@/lib/sandbox/types";

/**
 * Renders one control from a param definition. Switching on `param.kind` here
 * is the entire reason the panel is generic — it has no per-effect knowledge,
 * so a new effect brings its own UI for free.
 */
export function ParamControl({
  param,
  value,
  onChange,
}: {
  param: EffectParam;
  value: string | number;
  onChange: (next: string | number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] text-white/70">{param.label}</span>
        <span className="font-mono text-[10px] text-white/35">
          {param.kind === "number" ? `${value}${param.unit ?? ""}` : null}
        </span>
      </span>

      {param.kind === "number" && (
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={Number(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-lime
            [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime"
        />
      )}

      {param.kind === "select" && (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/[0.06] px-2 py-1.5 text-[11px] text-white"
        >
          {param.options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#15161d]">
              {o.label}
            </option>
          ))}
        </select>
      )}

      {param.kind === "color" && (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/[0.06] px-2 py-1.5 text-[11px] text-white"
        >
          {(param.tokens ?? []).map((t) => (
            <option key={t.value} value={t.value} className="bg-[#15161d]">
              {t.label}
            </option>
          ))}
        </select>
      )}

      {param.help && (
        <span className="mt-1 block text-[10px] text-white/30">{param.help}</span>
      )}
    </label>
  );
}
