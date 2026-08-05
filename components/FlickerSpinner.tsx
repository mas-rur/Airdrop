"use client";

import { useEffect, useState } from "react";

export interface FlickerSpinnerProps {
  /** Each frame is a flat boolean grid (49 cells = 7x7 by default). */
  grids: boolean[][];
  onColor?: string;
  offColor?: string;
  /** Pixel size of each dot. */
  size?: number;
  /** Pixel gap between dots. */
  gap?: number;
  /** How long each frame is shown, in ms. */
  intervalMs?: number;
  /** Grid column count; inferred from cell count (sqrt) if omitted. */
  columns?: number;
  label?: string;
}

/**
 * Reimplemented locally to match flicker-dot's `<FlickerSpinner
 * grids={grids} onColor="..." offColor="..." />` API exactly, without
 * adding an external package -- this sandbox can't verify/install new npm
 * dependencies, so this avoids that risk while behaving the same way.
 */
export function FlickerSpinner({
  grids,
  onColor = "#262626",
  offColor = "#E5E5E5",
  size = 6,
  gap = 3,
  intervalMs = 120,
  columns,
  label = "Loading",
}: FlickerSpinnerProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (grids.length <= 1) return;
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % grids.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [grids.length, intervalMs]);

  const cells = grids[frame] ?? grids[0] ?? [];
  const cols = columns ?? (Math.round(Math.sqrt(cells.length)) || 7);

  return (
    <div
      role="status"
      aria-label={label}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gap: `${gap}px`,
      }}
    >
      {cells.map((on, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: 9999,
            backgroundColor: on ? onColor : offColor,
            transition: "background-color 90ms linear",
          }}
        />
      ))}
    </div>
  );
}
