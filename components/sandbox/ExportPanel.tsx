"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { renderPortable, renderTailwind } from "@/lib/sandbox/css";
import { exportSnippet } from "@/lib/sandbox/runtimes/burst";
import type { EffectDef, ParamValues, TargetDef } from "@/lib/sandbox/types";

/**
 * All outputs are always visible, side by side. With no test setup in this
 * repo, that visibility IS the regression check: a renderer that stops
 * matching the preview is obvious the moment anyone opens this.
 */
export function ExportPanel({
  effect,
  values,
  target,
}: {
  effect: EffectDef;
  values: ParamValues;
  target: TargetDef;
}) {
  const tabs = ["CSS", "Tailwind", ...(effect.portability === "css+js" ? ["JS"] : [])];
  const [tab, setTab] = useState(tabs[0]);
  const [copied, setCopied] = useState(false);

  const tailwind = renderTailwind(effect, values);
  const body =
    tab === "CSS"
      ? `/* ${target.file} */\n\n${renderPortable(effect, values)}`
      : tab === "Tailwind"
        ? `${tailwind.theme}\n\n<!-- ${target.file} -->\nclass="${tailwind.classes}"`
        : exportSnippet;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard can be blocked; the code is on screen to select by hand.
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-white/10">
      <div className="flex items-center gap-1 px-3 pt-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "rounded-md px-2 py-1 text-[11px] transition-colors",
              tab === t ? "bg-white/[0.12] text-white" : "text-white/45 hover:text-white",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={copy}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-white/55 transition-colors hover:text-white"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="min-h-0 flex-1 overflow-auto px-3 pb-3 pt-2 font-mono text-[10px] leading-[1.5] text-white/70">
        {body}
      </pre>
    </div>
  );
}
