export interface TransactionIdentifier {
  readonly value: string;
}

/**
 * Randomness and clock are injected rather than read from global `Math.random`
 * / `Date.now` so the Domain stays a pure, deterministically testable function
 * (architecture.md §34) — Infrastructure supplies the real sources.
 *
 * The "SIM-" prefix and non-hex format are deliberate: this must never read
 * as a real blockchain transaction hash (FR-025, approved deviation).
 */
export function generateTransactionIdentifier(
  random: () => number,
  now: () => number,
): TransactionIdentifier {
  const timestampSegment = Math.floor(now()).toString(36);
  const randomSegment = Math.floor(random() * 36 ** 8)
    .toString(36)
    .padStart(8, "0");

  return { value: `SIM-${timestampSegment}-${randomSegment}` };
}
