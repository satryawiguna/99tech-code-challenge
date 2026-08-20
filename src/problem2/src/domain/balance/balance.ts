import Decimal from "decimal.js";

export interface Balance {
  readonly assetSymbol: string;
  readonly amount: Decimal;
}

export function findBalanceAmount(balances: readonly Balance[], assetSymbol: string): Decimal {
  return balances.find((balance) => balance.assetSymbol === assetSymbol)?.amount ?? new Decimal(0);
}

export function setBalanceAmount(
  balances: readonly Balance[],
  assetSymbol: string,
  amount: Decimal,
): Balance[] {
  const existing = balances.some((balance) => balance.assetSymbol === assetSymbol);
  if (existing) {
    return balances.map((balance) =>
      balance.assetSymbol === assetSymbol ? { assetSymbol, amount } : balance,
    );
  }
  return [...balances, { assetSymbol, amount }];
}

export function calculateHalfAmount(balance: Decimal): Decimal {
  return balance.dividedBy(2);
}

export function calculateMaxAmount(balance: Decimal): Decimal {
  return balance;
}

export function hasSufficientBalance(amount: Decimal, balance: Decimal): boolean {
  return amount.lessThanOrEqualTo(balance);
}
