"use client";

import { useState } from "react";

export function Logo({ size = 28 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="flex items-center justify-center rounded-lg bg-accent font-sans text-sm font-bold text-accent-ink"
        style={{ width: size, height: size }}
      >
        P
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- local static file
  return (
    <img
      src="/logo.png"
      alt="Pay3"
      width={size}
      height={size}
      className="rounded-lg object-contain"
      onError={() => setFailed(true)}
    />
  );
}
