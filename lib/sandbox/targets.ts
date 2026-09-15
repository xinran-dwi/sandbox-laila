import type { TargetDef } from "./types";

/**
 * What can be animated. Components opt in with a `data-sandbox-target`
 * attribute that is inert everywhere else.
 *
 * Ids are variant-unique on purpose: ImageDetailScreen renders its mobile and
 * desktop subtrees at the same time (lg:hidden / hidden lg:flex), so a shared
 * id would match two elements with one of them invisible.
 *
 * This registry is only an index of attributes that live in source, so it can
 * go stale. The preview reports which targets it actually found on every
 * handshake, and the panel greys out the rest — see SandboxBridge.
 */
export const targets: TargetDef[] = [
  {
    id: "cta-download-mobile",
    label: "Download CTA",
    screen: "image-detail",
    variant: "mobile",
    kind: "button",
    file: "components/screens/image-detail/DownloadButton.tsx",
    capabilities: ["transform", "click", "pseudo-after", "overflow-clip"],
    cardinality: "one",
  },
  {
    id: "cta-download-desktop",
    label: "Download CTA",
    screen: "image-detail",
    variant: "desktop",
    kind: "button",
    file: "components/screens/image-detail/DownloadButton.tsx",
    capabilities: ["transform", "click", "pseudo-after", "overflow-clip"],
    cardinality: "one",
  },
  {
    id: "thumb-up-mobile",
    label: "Thumbs up",
    screen: "image-detail",
    variant: "mobile",
    kind: "icon",
    file: "components/screens/image-detail/ResultFeedback.tsx",
    capabilities: ["transform", "click"],
    cardinality: "one",
  },
  {
    id: "thumb-up-desktop",
    label: "Thumbs up",
    screen: "image-detail",
    variant: "desktop",
    kind: "icon",
    file: "components/screens/image-detail/ResultFeedback.tsx",
    capabilities: ["transform", "click"],
    cardinality: "one",
  },
  {
    // The Photo WRAPPER, never the <img>: replaced elements can't host
    // generated content, so ::after overlays would silently do nothing.
    id: "hero-photo-mobile",
    label: "Hero photo",
    screen: "image-detail",
    variant: "mobile",
    kind: "image",
    file: "components/screens/image-detail/ImageStage.tsx",
    capabilities: ["transform", "pseudo-after", "overflow-clip", "loading-state"],
    cardinality: "one",
  },
  {
    id: "hero-photo-desktop",
    label: "Hero photo",
    screen: "image-detail",
    variant: "desktop",
    kind: "image",
    file: "components/screens/image-detail/DesktopViewer.tsx",
    capabilities: ["transform", "pseudo-after", "overflow-clip", "loading-state"],
    cardinality: "one",
  },
  {
    id: "action-card-mobile",
    label: "Action cards",
    screen: "image-detail",
    variant: "mobile",
    kind: "card",
    file: "components/screens/image-detail/ActionCard.tsx",
    capabilities: ["transform", "click"],
    cardinality: "many",
  },
  {
    id: "action-card-desktop",
    label: "Action cards",
    screen: "image-detail",
    variant: "desktop",
    kind: "card",
    file: "components/screens/image-detail/ActionCard.tsx",
    capabilities: ["transform", "click"],
    cardinality: "many",
  },
];

export function targetsFor(screen: string, variant: "mobile" | "desktop") {
  return targets.filter((t) => t.screen === screen && t.variant === variant);
}

export function findTarget(id: string) {
  return targets.find((t) => t.id === id) ?? null;
}
