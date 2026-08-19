import { describe, expect, it } from "vitest";
import { generateTransactionIdentifier } from "@/domain";
import { createTransactionIdSource } from "./transactionIdSource";

describe("createTransactionIdSource", () => {
  it("provides a random() in the [0, 1) range and a now() epoch-ms timestamp", () => {
    const source = createTransactionIdSource();

    const randomValue = source.random();
    expect(randomValue).toBeGreaterThanOrEqual(0);
    expect(randomValue).toBeLessThan(1);

    const nowValue = source.now();
    expect(Number.isFinite(nowValue)).toBe(true);
    expect(nowValue).toBeGreaterThan(0);
  });

  it("is a structurally compatible source for the Domain's generateTransactionIdentifier", () => {
    const source = createTransactionIdSource();

    const id = generateTransactionIdentifier(source.random, source.now);

    expect(id.value.startsWith("SIM-")).toBe(true);
    expect(id.value).not.toMatch(/^0x/);
  });
});
