import { imageActions } from "@/lib/fixtures/image-detail";
import { ActionCard } from "./ActionCard";

/* Measured gaps: mobile 10.4 x / 7.4 y, desktop 9.4 both axes. */
export function ActionGrid({ variant }: { variant: "mobile" | "desktop" }) {
  return (
    <div
      className={[
        "grid grid-cols-2",
        variant === "mobile" ? "gap-x-[10px] gap-y-[7px]" : "gap-[9px]",
      ].join(" ")}
    >
      {imageActions.map((action) => (
        <ActionCard key={action.id} action={action} variant={variant} />
      ))}
    </div>
  );
}
