"use client";

import type { CSSProperties } from "react";
import type { RewardTier } from "@/lib/airdrop-config";
import { TokenIcon } from "./icons/TokenIcons";

export const ITEM_HEIGHT = 64;
export const VISIBLE_ROWS = 5;
export const CENTER_ROW = Math.floor(VISIBLE_ROWS / 2);

/** Where the winning tier needs to end up so it lands in the center row. */
export function reelOffsetFor(sequenceLength: number): number {
  const finalIndex = sequenceLength - 1;
  return -(finalIndex - CENTER_ROW) * ITEM_HEIGHT;
}

interface SpinReelProps {
  sequence: RewardTier[];
  spinKey: number;
  spinning: boolean;
  onSettled?: () => void;
}

export function SpinReel({ sequence, spinKey, spinning, onSettled }: SpinReelProps) {
  const height = ITEM_HEIGHT * VISIBLE_ROWS;
  const endOffset = reelOffsetFor(sequence.length);

  const trackStyle: CSSProperties = {
    transform: spinning ? undefined : `translateY(${endOffset}px)`,
    ["--reel-start" as string]: "0px",
    ["--reel-end" as string]: `${endOffset}px`,
  };

  return (
    <div className="relative mx-auto max-w-xs" style={{ height }}>
      {/* fixed highlight for the center (selected) row, sits behind the
          scrolling items so the winning item's text/icon render on top */}
      <div
        className="absolute left-0 right-0 rounded-2xl bg-surface"
        style={{ top: CENTER_ROW * ITEM_HEIGHT, height: ITEM_HEIGHT }}
      />

      <div
        className="relative overflow-hidden"
        style={{
          height,
          maskImage:
            "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
        }}
      >
        <div
          key={spinKey}
          className={spinning ? "reel-spinning" : ""}
          style={trackStyle}
          onAnimationEnd={() => spinning && onSettled?.()}
        >
          {sequence.map((tier, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-2.5"
              style={{ height: ITEM_HEIGHT }}
            >
              {tier.token && <TokenIcon token={tier.token} size={26} />}
              <span
                className={`font-sans text-sm font-medium ${
                  tier.amount ? "text-foreground" : "text-muted"
                }`}
              >
                {tier.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
