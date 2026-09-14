import { Copy, Heart, Menu, Pin, RotateCcw, SquarePen } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";
import { ActionGrid } from "./ActionGrid";
import { DownloadButton } from "./DownloadButton";
import { IconButton } from "./IconButton";
import { Photo } from "./Photo";
import { ThumbnailRail } from "./ThumbnailRail";

function Divider() {
  return <hr className="my-[15px] border-0 border-t border-subtle" />;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[15px] font-normal text-ink">{children}</h2>
  );
}

function EditIcons() {
  return (
    <div className="flex items-center gap-3 text-ink">
      <IconButton label="Regenerate">
        <RotateCcw className="size-[15px]" strokeWidth={1.6} />
      </IconButton>
      <IconButton label="Edit">
        <SquarePen className="size-[15px]" strokeWidth={1.6} />
      </IconButton>
      <IconButton label="Copy">
        <Copy className="size-[15px]" strokeWidth={1.6} />
      </IconButton>
    </div>
  );
}

export function DesktopPanel() {
  return (
    <div className="flex w-[500px] shrink-0 bg-panel">
      <div className="flex min-w-0 flex-1 flex-col pl-[14px] pr-[10px] pb-[22px] pt-[27px]">
        {/* Title row */}
        <div className="flex h-[26px] items-center justify-between">
          <h1 className="text-[17px] font-normal text-ink">
            {imageDetail.desktopTitle}{" "}
            <span className="text-ink-muted">{imageDetail.age}</span>
          </h1>
          <div className="flex items-center gap-4">
            <IconButton label="Pin">
              <Pin className="size-[18px]" strokeWidth={1.6} />
            </IconButton>
            <IconButton label="Favorite">
              <Heart className="size-[18px]" strokeWidth={1.6} />
            </IconButton>
            <IconButton label="More">
              <Menu className="size-[18px]" strokeWidth={1.6} />
            </IconButton>
          </div>
        </div>

        <div className="scrollbar-slim mt-10 min-h-0 flex-1 overflow-y-auto pr-1">
          <ActionGrid variant="desktop" />

          <Divider />

          <section>
            <SectionHeading>Prompt</SectionHeading>
            <p className="text-[13px] leading-[1.55] text-ink-secondary">
              {imageDetail.prompt}
            </p>
          </section>

          <Divider />

          <section>
            <SectionHeading>Reference Image</SectionHeading>
            <div className="w-[115px]">
              <Photo
                src={imageDetail.referenceImage.src}
                alt={imageDetail.referenceImage.caption}
                className="aspect-square w-full rounded-lg"
              />
              <p className="mt-2 text-center text-[11px] text-ink-secondary">
                {imageDetail.referenceImage.caption}
              </p>
            </div>
          </section>

          <Divider />

          <section>
            <SectionHeading>Generated Description</SectionHeading>

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-muted">Description</span>
              <EditIcons />
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
              {imageDetail.generated.description}
            </p>

            <Divider />

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-muted">Content</span>
              <EditIcons />
            </div>
            <div className="mt-1.5 space-y-1 text-[13px] leading-[1.55] text-ink-secondary">
              {imageDetail.generated.content.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>
        </div>

        <div className="pt-[22px]">
          <DownloadButton variant="desktop" />
        </div>
      </div>

      <ThumbnailRail />
    </div>
  );
}
