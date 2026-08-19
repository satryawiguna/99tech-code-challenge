/**
 * Slippage is represented as a fraction (0.001 = 0.1%) so it can be used
 * directly in `receiveAmount × (1 - slippage)` (BR-005) without a hidden
 * unit conversion.
 */
export const SLIPPAGE_TOLERANCES = [0.001, 0.005, 0.01] as const;

export type SlippageTolerance = (typeof SLIPPAGE_TOLERANCES)[number];

export function isSlippageTolerance(value: number): value is SlippageTolerance {
  return (SLIPPAGE_TOLERANCES as readonly number[]).includes(value);
}
