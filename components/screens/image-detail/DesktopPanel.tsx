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
  return <h2 className="mb-2 text-[13.5px] font-normal text-ink">{children}</h2>;
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

/**
 * Measured: panel spans x939-1440 (501 wide). Content column x956-1365 (409),
 * then a 12px gap, the 53px thumbnail rail, and a 10px right margin.
 * Action grid sits at y87.5; CTA is 408 x 39 ending 22px above the bottom.
 */
export function DesktopPanel() {
  return (
    <div className="surface-panel flex w-[501px] shrink-0">
      <div className="flex min-w-0 flex-1 flex-col pb-[22px] pl-[17px] pr-0 pt-[27px]">
        <div className="flex h-[26px] items-center justify-between">
          <h1 className="text-[14px] font-normal text-ink">
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

        <div className="scrollbar-slim mt-[34px] min-h-0 flex-1 overflow-y-auto">
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
                className="h-[112px] w-full rounded-lg"
              />
              <p className="mt-1.5 text-center text-[10px] text-ink-secondary">
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
