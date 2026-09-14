"use client";

import { useState } from "react";

/**
 * Plain <img> over a gradient placeholder.
 * Until the real crops from design-refs land in /public/img, a missing file
 * falls back to the gradient silently (no broken-image alt text).
 */
export function Photo({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      role="img"
      aria-label={alt}
      className={[
        "relative overflow-hidden bg-[linear-gradient(135deg,#2b2f7a_0%,#4a3b6e_45%,#8a5f3c_100%)]",
        className,
      ].join(" ")}
    >
      <img
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        className={[
          "size-full object-cover transition-opacity",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        ].join(" ")}
      />
    </div>
  );
}
