import { ArrowDownToLine } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";

/* Measured: mobile 351 x 54, desktop 408 x 39. */
export function DownloadButton({ variant }: { variant: "mobile" | "desktop" }) {
  const isMobile = variant === "mobile";
  return (
    <button
      type="button"
      data-sandbox-target={`cta-download-${variant}`}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-full",
        "bg-lime text-lime-ink transition-opacity hover:opacity-90",
        isMobile
          ? "h-[54px] text-[17px] font-semibold"
          : "h-[39px] text-[15px] font-semibold",
      ].join(" ")}
    >
      <ArrowDownToLine
        className={isMobile ? "size-[18px]" : "size-4"}
        strokeWidth={2}
      />
      {imageDetail.downloadCta}
    </button>
  );
}
