import { IdCard } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";
import { Photo } from "./Photo";

/* Measured: photo spans y133-452 at full width — 390 x 320. */
export function ImageStage() {
  const { slides, activeIndex, mobileImage } = imageDetail.carousel;

  return (
    <div className="relative">
      <Photo
        src={mobileImage}
        alt="Generated image"
        className="aspect-[390/320] w-full"
      />

      <div className="pointer-events-none absolute left-2.5 top-[15px] flex h-[31px] items-center gap-1.5 rounded-full bg-overlay px-3 backdrop-blur-md">
        <IdCard className="size-[15px] text-ink" strokeWidth={1.6} />
        <span className="text-[11px] text-ink">{imageDetail.detailsPill}</span>
      </div>

      <div className="absolute inset-x-0 bottom-[18px] flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
          {Array.from({ length: slides }).map((_, i) => (
            <span
              key={i}
              className={[
                "size-1.5 rounded-full",
                i === activeIndex ? "bg-lime" : "bg-white/40",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
