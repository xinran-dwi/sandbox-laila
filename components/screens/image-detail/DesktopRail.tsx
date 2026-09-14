import {
  Gem,
  Headphones,
  Images,
  MessagesSquare,
  Settings,
  WandSparkles,
} from "lucide-react";
import type { IconType } from "./IconButton";

const navIcons: Record<string, IconType> = {
  content: Images,
  subscriptions: Gem,
  studio: WandSparkles,
  chat: MessagesSquare,
};

const nav = [
  { id: "content", label: "Content", active: true },
  { id: "subscriptions", label: "Subscriptions", active: false },
  { id: "studio", label: "Studio", active: false },
  { id: "chat", label: "Chat", active: false },
];

function RailItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: IconType;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "flex w-full flex-col items-center gap-1.5 py-2.5 transition-colors",
        active ? "text-lime" : "text-ink hover:text-lime",
      ].join(" ")}
    >
      <Icon className="size-[19px]" strokeWidth={1.5} />
      <span className="text-[9.5px] leading-none">{label}</span>
    </button>
  );
}

/* Measured: rail occupies x0-71 — 72px wide. */
export function DesktopRail() {
  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center bg-rail py-5">
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold leading-[1.1] text-ink">
          Daem
          <br />
          AI
        </span>
        <span className="size-3.5 rounded-full border-[2.5px] border-lime border-r-transparent" />
      </div>

      <nav className="mt-7 flex w-full flex-col gap-1.5">
        {nav.map((item) => (
          <RailItem
            key={item.id}
            icon={navIcons[item.id]}
            label={item.label}
            active={item.active}
          />
        ))}
      </nav>

      <div className="mt-auto flex w-full flex-col items-center gap-3">
        <span className="rounded-md bg-[#7b2ff7] px-2.5 py-1.5 text-[11px] font-semibold text-white">
          qitaf
        </span>
        <RailItem icon={Headphones} label="Support" />
        <RailItem icon={Settings} label="Settings" />
        <button type="button" className="text-[11px] text-ink">
          عربي
        </button>
        <span className="size-7 rounded-full bg-[linear-gradient(135deg,#f0a868,#8a5f3c)]" />
      </div>
    </aside>
  );
}
