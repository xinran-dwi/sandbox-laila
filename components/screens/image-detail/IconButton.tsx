import type { ComponentType, ReactNode } from "react";

export function IconButton({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={[
        "inline-flex items-center justify-center text-ink transition-colors",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;
