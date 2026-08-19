/**
 * Application-owned port for the real entropy/clock source that Domain's
 * pure `generateTransactionIdentifier` needs. Structurally identical to
 * Infrastructure's `TransactionIdSource`, satisfied without an explicit
 * adapter (see pricePort.ts for the same pattern).
 */
export interface TransactionIdSource {
  readonly random: () => number;
  readonly now: () => number;
}
