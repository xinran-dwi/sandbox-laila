/**
 * All copy + asset paths for the Image Detail screen live here.
 * Swapping fixtures should never require touching a component.
 */

export type ActionId =
  | "write-description"
  | "add-text"
  | "edit-ai"
  | "edit-manual"
  | "add-logo"
  | "add-sticker";

export type ActionBadge = "Business" | "Advanced";

export type ImageAction = {
  id: ActionId;
  label: string;
  badge?: ActionBadge;
};

export const imageActions: ImageAction[] = [
  { id: "write-description", label: "Write Description", badge: "Business" },
  { id: "add-text", label: "Add Text" },
  { id: "edit-ai", label: "Edit using AI" },
  { id: "edit-manual", label: "Edit Manually" },
  { id: "add-logo", label: "Add logo", badge: "Advanced" },
  { id: "add-sticker", label: "Add Sticker" },
];

export const imageDetail = {
  mobileTitle: "Image",
  desktopTitle: "Shoes Presentation",
  age: "3w",
  backLabel: "AI Images",
  detailsPill: "Image details",
  notice:
    "You can generate content for your image to be shared on your social media accounts",
  feedbackPrompt: "How is the result?",
  downloadCta: "Download Image",
  prompt:
    "Discover the latest Nike shoes, energized by a striking green smoke effect that symbolizes speed and innovation. Step into a world where style meets performance, and every move leaves  a trail of bold energy.",
  referenceImage: {
    src: "/img/reference.jpg",
    caption: "Cinematic View",
  },
  generated: {
    description:
      "Discover the latest Nike shoes, energized by a striking green smoke effect that symbolizes speed and innovation.",
    content: ["1- This is an example", "2- This is another example"],
  },
  carousel: {
    slides: 5,
    activeIndex: 0,
    mobileImage: "/img/hero-mobile.jpg",
    desktopImage: "/img/hero-desktop.jpg",
  },
  thumbnails: [
    { id: "t1", src: "/img/thumb-1.jpg", alt: "Chicken sandwich meal" },
    { id: "t2", src: "/img/thumb-2.jpg", alt: "Green plated dish" },
  ],
} as const;

export const railItems = [
  { id: "content", label: "Content", active: true },
  { id: "subscriptions", label: "Subscriptions", active: false },
  { id: "studio", label: "Studio", active: false },
  { id: "chat", label: "Chat", active: false },
] as const;
