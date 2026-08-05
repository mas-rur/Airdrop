"use client";

import type { CSSProperties } from "react";
import { REWARD_TIERS } from "@/lib/airdrop-config";

export const SLICE_COLORS = [
  "#E9EAF2", // Better luck next time
  "#8FD9C4", // 0.01 USDT
  "#9CC3F5", // 0.01 USDC
  "#6FB0EF", // 0.1 USDC
  "#5CC9AC", // 0.1 USDT
  "#3D8FE0", // 1 USDC
  "#2FB090", // 1 USDT
  "#2775CA", // 5 USDC (USDC brand blue)
  "#26A17B", // 5 USDT (USDT brand green)
  "#F5B942", // 10 USDC -- jackpot gold
];

export const SLICE_COUNT = REWARD_TIERS.length;
export const SLICE_DEG = 360 / SLICE_COUNT;

interface SpinWheelProps {
  spinKey: number;
  startDeg: number;
  endDeg: number;
  spinning: boolean;
  size?: number;
  onSettled?: () => void;
}

export function SpinWheel({
  spinKey,
  startDeg,
  endDeg,
  spinning,
  size = 280,
  onSettled,
}: SpinWheelProps) {
  const gradientStops = REWARD_TIERS.map((_, i) => {
    const color = SLICE_COLORS[i % SLICE_COLORS.length];
    return `${color} ${i * SLICE_DEG}deg ${(i + 1) * SLICE_DEG}deg`;
  }).join(", ");

  const wheelStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "9999px",
    background: `conic-gradient(${gradientStops})`,
    border: "6px solid var(--background)",
    boxShadow: "0 0 0 2px var(--border), 0 12px 32px -12px rgba(20,21,26,0.25)",
    transform: spinning ? undefined : `rotate(${endDeg}deg)`,
    ["--wheel-start" as string]: `${startDeg}deg`,
    ["--wheel-end" as string]: `${endDeg}deg`,
  };

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-10">
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderTop: "16px solid var(--foreground)",
          }}
        />
      </div>

      <div
        key={spinKey}
        className={spinning ? "wheel-spinning" : ""}
        style={wheelStyle}
        onAnimationEnd={() => spinning && onSettled?.()}
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
        <span className="font-sans text-[10px] font-bold tracking-wide text-muted">SPIN</span>
      </div>
    </div>
  );
}

export function WheelLegend() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
      {REWARD_TIERS.map((tier, i) => (
        <div key={tier.id} className="flex items-center gap-2 text-xs">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
          />
          <span className={tier.amount ? "text-foreground" : "text-muted"}>{tier.label}</span>
        </div>
      ))}
    </div>
  );
}
