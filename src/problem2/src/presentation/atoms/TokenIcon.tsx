"use client";

import { useState } from "react";
import { FALLBACK_TOKEN_ICON_PATH, resolveTokenIconPath } from "@/state";

export interface TokenIconProps {
  readonly symbol: string;
  readonly size?: number;
}

/**
 * alt="" is deliberate: the symbol is always rendered as adjacent text next
 * to this icon, so it is decorative rather than the sole identity signal
 * (PRD §17). `erroredSymbol` remembers only the specific symbol whose image
 * failed to load — if `symbol` later changes, the fallback no longer
 * applies and a fresh resolution is attempted, without needing an effect to
 * reset derived state on prop change.
 *
 * Hover flip: a purely decorative rotateY transition matching the design
 * baseline's icon hover treatment. No business meaning, local UI-only state.
 */
export function TokenIcon({ symbol, size = 24 }: TokenIconProps) {
  const [erroredSymbol, setErroredSymbol] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const src = erroredSymbol === symbol ? FALLBACK_TOKEN_ICON_PATH : resolveTokenIconPath(symbol);

  return (
    <span
      className="token-icon"
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small local static SVGs, no remote optimization needed */}
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setErroredSymbol(symbol)}
        style={{
          transform: `rotateY(${isHovered ? 360 : 0}deg)`,
          transition: "transform 700ms ease-out",
        }}
      />
    </span>
  );
}
