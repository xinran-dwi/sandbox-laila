import { ArrowLeft, Headphones, Heart, Menu, Pin } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";
import { IconButton } from "./IconButton";

export function MobileHeader() {
  return (
    /* pt leaves the status-bar room the Figma frame reserves but doesn't draw */
    <header className="px-5 pt-[46px]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-[15px] text-ink"
        >
          <ArrowLeft className="size-[18px]" strokeWidth={1.8} />
          {imageDetail.backLabel}
        </button>
        <IconButton label="Support" className="size-9 rounded-full bg-elevated">
          <Headphones className="size-[18px]" strokeWidth={1.6} />
        </IconButton>
      </div>

      <div className="mt-[18px] flex items-center justify-between pb-[9px]">
        <h1 className="text-[17px] font-normal leading-[21px] text-ink">
          {imageDetail.mobileTitle}{" "}
          <span className="text-ink-muted">{imageDetail.age}</span>
        </h1>
        <div className="flex items-center gap-[18px]">
          <IconButton label="Favorite">
            <Heart className="size-[21px]" strokeWidth={1.6} />
          </IconButton>
          <IconButton label="Pin">
            <Pin className="size-[21px]" strokeWidth={1.6} />
          </IconButton>
          <IconButton label="More">
            <Menu className="size-[21px]" strokeWidth={1.6} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
