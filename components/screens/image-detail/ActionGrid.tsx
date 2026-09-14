import { imageActions } from "@/lib/fixtures/image-detail";
import { ActionCard } from "./ActionCard";

export function ActionGrid({ variant }: { variant: "mobile" | "desktop" }) {
  return (
    <div
      className={[
        "grid grid-cols-2",
        variant === "mobile" ? "gap-2" : "gap-x-2 gap-y-[19px]",
      ].join(" ")}
    >
      {imageActions.map((action) => (
        <ActionCard key={action.id} action={action} variant={variant} />
      ))}
    </div>
  );
}
