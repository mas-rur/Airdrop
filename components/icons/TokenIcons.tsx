"use client";

import { useState } from "react";
import type { TokenSymbol } from "@/lib/airdrop-config";

/**
 * Hotlinks the official logo images directly from their source (Wikimedia
 * Commons for USDT, cryptologos.cc for USDC) rather than copying/hosting
 * them ourselves -- used purely to identify which stablecoin a reward is
 * denominated in, same as any exchange or portfolio tracker does. Falls
 * back to a plain monogram badge if the remote image ever fails to load.
 */
const LOGO_SRC: Record<TokenSymbol, string> = {
  USDT: "https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
};

const FALLBACK_COLOR: Record<TokenSymbol, string> = {
  USDT: "#26A17B",
  USDC: "#2775CA",
};

export function TokenIcon({
  token,
  size = 28,
  className = "",
}: {
  token: TokenSymbol;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`flex items-center justify-center rounded-full font-sans text-[9px] font-bold text-white shrink-0 ${className}`}
        style={{ width: size, height: size, backgroundColor: FALLBACK_COLOR[token] }}
      >
        {token}
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- external hotlink, no Next/Image domain config needed
  return (
    <img
      src={LOGO_SRC[token]}
      alt={token}
      width={size}
      height={size}
      className={`rounded-full object-contain shrink-0 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
