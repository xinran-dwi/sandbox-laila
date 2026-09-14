import { ArrowLeft, Headphones, Heart, Menu, Pin } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";
import { IconButton } from "./IconButton";

/**
 * Measured against the mobile frame, normalised to 390 design px:
 *   back row ink y63-75, support circle y52-83 (32px)
 *   title ink y110-120, row icons spanning x293-368
 *   photo starts at y133
 * The type here is smaller than the action-card labels — that's what the frame
 * shows, measured three ways (ink width, ink height, and glyph profile).
 */
export function MobileHeader() {
  return (
    <header className="px-5 pb-[10px] pt-[52px]">
      <div className="flex h-8 items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1.5 text-[10px] text-ink"
        >
          <ArrowLeft className="size-[13px]" strokeWidth={1.8} />
          {imageDetail.backLabel}
        </button>
        <IconButton label="Support" className="size-8 rounded-full bg-elevated">
          <Headphones className="size-[15px]" strokeWidth={1.6} />
        </IconButton>
      </div>

      <div className="mt-[24px] flex h-[15px] items-center justify-between">
        <h1 className="text-[11.5px] font-normal leading-[15px] text-ink">
          {imageDetail.mobileTitle}{" "}
          <span className="text-ink-muted">{imageDetail.age}</span>
        </h1>
        <div className="flex items-center gap-[12px]">
          <IconButton label="Favorite">
            <Heart className="size-[18px]" strokeWidth={1.6} />
          </IconButton>
          <IconButton label="Pin">
            <Pin className="size-[18px]" strokeWidth={1.6} />
          </IconButton>
          <IconButton label="More">
            <Menu className="size-[18px]" strokeWidth={1.6} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
