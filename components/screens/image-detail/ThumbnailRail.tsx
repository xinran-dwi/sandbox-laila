import { imageDetail } from "@/lib/fixtures/image-detail";
import { Photo } from "./Photo";

/* Measured: thumbnails x1377-1430 (53 wide), rows at y12 and y73 — 51px tall. */
export function ThumbnailRail({ activeId = "t1" }: { activeId?: string }) {
  return (
    <div className="flex w-[75px] shrink-0 flex-col gap-[11px] pl-[12px] pr-[10px] pt-[12px]">
      {imageDetail.thumbnails.map((thumb) => (
        <button key={thumb.id} type="button" className="block">
          <Photo
            src={thumb.src}
            alt={thumb.alt}
            className={[
              "aspect-square w-full rounded-[10px]",
              thumb.id === activeId ? "ring-2 ring-lime" : "opacity-90",
            ].join(" ")}
          />
        </button>
      ))}
    </div>
  );
}
