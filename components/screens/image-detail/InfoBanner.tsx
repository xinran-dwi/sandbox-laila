import { CircleAlert } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";

/* Measured: two text lines spanning y474-498, icon column starting x19. */
export function InfoBanner() {
  return (
    <div className="flex items-start gap-2.5 px-5 pb-[21px] pt-[19px] text-warn">
      <CircleAlert className="mt-px size-[17px] shrink-0" strokeWidth={1.6} />
      <p className="text-[13.5px] leading-[16px]">{imageDetail.notice}</p>
    </div>
  );
}
