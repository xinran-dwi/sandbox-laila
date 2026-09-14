import { imageDetail } from "@/lib/fixtures/image-detail";
import { Photo } from "./Photo";

export function ThumbnailRail({ activeId = "t1" }: { activeId?: string }) {
  return (
    <div className="flex w-[66px] shrink-0 flex-col gap-2 pr-[12px] pt-[16px]">
      {imageDetail.thumbnails.map((thumb) => (
        <button key={thumb.id} type="button" className="block">
          <Photo
            src={thumb.src}
            alt={thumb.alt}
            className={[
              "aspect-square w-full rounded-[10px]",
              thumb.id === activeId
                ? "ring-2 ring-lime ring-offset-0"
                : "opacity-90",
            ].join(" ")}
          />
        </button>
      ))}
    </div>
  );
}
