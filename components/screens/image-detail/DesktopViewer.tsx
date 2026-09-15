import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";
import { Photo } from "./Photo";

/** Dimmed, blurred stand-in for the gallery page sitting behind the modal. */
function BackdropStandIn() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 scale-105 opacity-[0.22] blur-[7px]">
        <div className="flex h-full flex-col gap-6 p-10">
          <div className="flex items-center gap-4">
            <div className="h-9 w-64 rounded-full bg-skeleton" />
            <div className="ml-auto h-9 w-28 rounded-full bg-skeleton" />
            <div className="h-9 w-28 rounded-full bg-skeleton" />
          </div>
          <div className="flex gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 w-32 rounded-2xl bg-skeleton" />
            ))}
          </div>
          <div className="h-5 w-40 rounded-full bg-skeleton" />
          <div className="flex gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-40 w-52 rounded-2xl bg-skeleton opacity-80" />
            ))}
          </div>
          <div className="mt-auto flex gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 w-56 rounded-2xl bg-skeleton opacity-60" />
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-scrim" />
    </div>
  );
}

function ArrowButton({ side, label }: { side: "left" | "right"; label: string }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      className={[
        "absolute top-1/2 z-10 flex size-[48px] -translate-y-1/2 items-center justify-center",
        "rounded-full bg-chip text-ink backdrop-blur-sm",
        "transition-colors hover:bg-chip-hover",
        side === "left" ? "left-[25px]" : "right-[25px]",
      ].join(" ")}
    >
      <Icon className="size-5" strokeWidth={1.8} />
    </button>
  );
}

/* Measured: viewer spans x72-938 (867 wide); image is 503 x 502, centred. */
export function DesktopViewer() {
  return (
    <div className="relative flex flex-1 items-center justify-center bg-viewer">
      <BackdropStandIn />

      <button
        type="button"
        aria-label="Close"
        className="absolute right-6 top-5 z-10 text-ink transition-opacity hover:opacity-70"
      >
        <X className="size-[22px]" strokeWidth={1.6} />
      </button>

      <ArrowButton side="left" label="Previous image" />
      <ArrowButton side="right" label="Next image" />

      <Photo
        src={imageDetail.carousel.desktopImage}
        alt="Generated image"
        sandboxTarget="hero-photo-desktop"
        className="relative z-[5] aspect-square w-[503px] max-w-[62%] rounded-[var(--radius-image)]"
      />
    </div>
  );
}
