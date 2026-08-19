/**
 * The simulated transaction-ID *format* (domain.md §5.10 — a clearly local,
 * non-hash-like "SIM-…" value) is a Domain concern already implemented by
 * `generateTransactionIdentifier` in the Domain layer, which requires an
 * injected `random`/`now` source to stay pure and deterministically testable.
 *
 * This module supplies that real, side-effecting source. It intentionally
 * does not call into Domain itself — Infrastructure may depend on Domain
 * types, not Domain runtime logic (architecture.md §5.1) — so wiring this
 * source into `generateTransactionIdentifier` is left to the Application
 * layer.
 */
export interface TransactionIdSource {
  readonly random: () => number;
  readonly now: () => number;
}

export function createTransactionIdSource(): TransactionIdSource {
  return {
    random: () => Math.random(),
    now: () => Date.now(),
  };
}
