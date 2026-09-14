"use client";

import { useState } from "react";

/**
 * Photography cropped out of the reference frames by
 * `scripts/measure-ref.py crop`, over a gradient placeholder.
 *
 * Visibility is NOT gated on `onLoad`: a cached image finishes loading before
 * React attaches its handler, so the load event never fires and the image
 * stays invisible. Only a genuine error hides it.
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
  const [failed, setFailed] = useState(false);

  return (
    <div
      role="img"
      aria-label={alt}
      className={[
        "relative overflow-hidden bg-[linear-gradient(135deg,#2b2f7a_0%,#4a3b6e_45%,#8a5f3c_100%)]",
        className,
      ].join(" ")}
    >
      {!failed && (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          className={["size-full object-cover", imgClassName].join(" ")}
        />
      )}
    </div>
  );
}
