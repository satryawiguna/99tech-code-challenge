import Decimal from "decimal.js";

export interface NormalizedPrice {
  readonly currency: string;
  readonly price: Decimal;
  readonly timestamp: number;
}
