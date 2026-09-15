import type { ImageAction } from "@/lib/fixtures/image-detail";
import { actionIcons } from "./actionIcons";

const badgeStyles: Record<string, string> = {
  Business: "bg-business text-business-ink",
  Advanced: "bg-advanced text-advanced-ink",
};

/**
 * Metrics are measured off the Figma frames, not chosen. The corner radius is
 * a full stadium on both breakpoints — the edge profile reaches full width at
 * exactly half the card height — not the rounded rectangle an earlier pass drew.
 *
 *   mobile  168.5 x 63.4 — 12px above the icon glyph, 13.4px below the text
 *   desktop 200   x 54.6 —  9.5px above,              11px below
 * The design draws no border on these cards; an earlier pass invented one.
 */
export function ActionCard({
  action,
  variant,
}: {
  action: ImageAction;
  variant: "mobile" | "desktop";
}) {
  const Icon = actionIcons[action.id];
  const isMobile = variant === "mobile";

  return (
    <button
      type="button"
      data-sandbox-target={`action-card-${variant}`}
      className={[
        "group flex w-full flex-col items-center text-ink transition-colors",
        isMobile
          ? "h-[63px] gap-2 rounded-full bg-card pt-[10px] hover:bg-card-hover"
          : "h-[55px] gap-[7px] rounded-full bg-card-panel pt-[10px] hover:bg-card-panel-hover",
      ].join(" ")}
    >
      <Icon
        className={isMobile ? "size-[18px]" : "size-[14px]"}
        strokeWidth={1.6}
      />
      <span className="flex items-center gap-1.5">
        <span
          className={
            isMobile
              ? "text-[14px] font-normal leading-none"
              : "text-[12.5px] font-normal leading-none"
          }
        >
          {action.label}
        </span>
        {action.badge && !isMobile && (
          <span
            className={[
              "rounded-full px-[3px] py-[2.5px] text-[9px] font-medium leading-none",
              badgeStyles[action.badge],
            ].join(" ")}
          >
            {action.badge}
          </span>
        )}
      </span>
    </button>
  );
}
