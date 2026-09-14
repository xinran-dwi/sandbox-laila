import {
  ImagePlus,
  SquarePen,
  Sticker,
  TextCursorInput,
  WandSparkles,
  Stamp,
} from "lucide-react";
import type { ActionId } from "@/lib/fixtures/image-detail";
import type { ComponentType } from "react";

type IconProps = { className?: string; strokeWidth?: number };

export const actionIcons: Record<ActionId, ComponentType<IconProps>> = {
  "write-description": WandSparkles,
  "add-text": TextCursorInput,
  "edit-ai": ImagePlus,
  "edit-manual": SquarePen,
  "add-logo": Stamp,
  "add-sticker": Sticker,
};
