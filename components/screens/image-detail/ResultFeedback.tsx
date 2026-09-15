"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { imageDetail } from "@/lib/fixtures/image-detail";

type Rating = "up" | "down";

/* Measured from the reference crop: 14px label, 18px icons, 16px gap after the
   label and 14px between the thumbs. Sits 22px under the action grid. */
export function ResultFeedback({ variant }: { variant: "mobile" | "desktop" }) {
  const [rating, setRating] = useState<Rating | null>(null);
  const isMobile = variant === "mobile";
  const iconSize = isMobile ? "size-[20px]" : "size-[17px]";

  return (
    <div
      className={[
        "flex items-center justify-center",
        isMobile ? "gap-4 text-[14px]" : "gap-3 text-[13px]",
      ].join(" ")}
    >
      <span className="text-ink">{imageDetail.feedbackPrompt}</span>
      <div className={isMobile ? "flex items-center gap-3.5" : "flex items-center gap-3"}>
        {(
          [
            { value: "up", label: "Good result", Icon: ThumbsUp },
            { value: "down", label: "Bad result", Icon: ThumbsDown },
          ] as const
        ).map(({ value, label, Icon }) => {
          const selected = rating === value;
          return (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={selected}
              onClick={() => setRating(selected ? null : value)}
              className={[
                "inline-flex items-center justify-center transition-colors",
                selected ? "text-lime" : "text-ink hover:text-lime",
              ].join(" ")}
            >
              <Icon
                className={iconSize}
                strokeWidth={1.8}
                fill={selected ? "currentColor" : "none"}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
