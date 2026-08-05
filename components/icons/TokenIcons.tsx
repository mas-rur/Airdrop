import type { SVGProps } from "react";

/**
 * Deliberately generic: a colored circle with a text monogram, not a
 * reproduction of Tether's or Circle's actual logo mark. The distinctive
 * graphic symbols are their trademarks -- recreating the recognizable
 * shape would defeat the point of avoiding that, even redrawn by hand.
 * Brand color is used only as a legibility cue for which token is which.
 */

export function UsdtIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" width={28} height={28} {...props}>
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="#fff"
      >
        USDT
      </text>
    </svg>
  );
}

export function UsdcIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" width={28} height={28} {...props}>
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="#fff"
      >
        USDC
      </text>
    </svg>
  );
}

export function TokenIcon({
  token,
  ...props
}: { token: "USDT" | "USDC" } & SVGProps<SVGSVGElement>) {
  return token === "USDT" ? <UsdtIcon {...props} /> : <UsdcIcon {...props} />;
}
