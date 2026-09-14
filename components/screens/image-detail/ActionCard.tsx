import type { ImageAction } from "@/lib/fixtures/image-detail";
import { actionIcons } from "./actionIcons";

const badgeStyles: Record<string, string> = {
  Business: "bg-business text-business-ink",
  Advanced: "bg-advanced text-advanced-ink",
};

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
      className={[
        "group flex w-full flex-col items-center justify-center",
        "border border-subtle bg-card text-ink",
        "transition-colors hover:bg-card-hover",
        isMobile
          ? "h-[67px] gap-2 rounded-[var(--radius-card)] px-3"
          : "h-[45px] gap-1.5 rounded-[var(--radius-panel)] px-3",
      ].join(" ")}
    >
      <Icon
        className={isMobile ? "size-[20px]" : "size-[16px]"}
        strokeWidth={1.6}
      />
      <span className="flex items-center gap-1.5">
        <span
          className={
            isMobile
              ? "text-[15px] font-normal leading-none"
              : "text-[12.5px] font-normal leading-none"
          }
        >
          {action.label}
        </span>
        {action.badge && !isMobile && (
          <span
            className={[
              "rounded-full px-1.5 py-[3px] text-[9px] font-medium leading-none",
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
