import { CircleAlert } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";

export function InfoBanner() {
  return (
    <div className="flex items-start gap-2.5 px-5 pb-[13px] pt-[14px] text-warn">
      <CircleAlert className="mt-px size-[17px] shrink-0" strokeWidth={1.6} />
      <p className="text-[13.5px] leading-[16px]">{imageDetail.notice}</p>
    </div>
  );
}
