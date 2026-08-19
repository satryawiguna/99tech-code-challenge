import { describe, expect, it } from "vitest";
import { generateTransactionIdentifier } from "./transactionIdentifier";

describe("generateTransactionIdentifier", () => {
  it("uses a clearly simulated, non-hash-like local format", () => {
    const id = generateTransactionIdentifier(
      () => 0.42,
      () => 1_693_296_652_000,
    );

    expect(id.value.startsWith("SIM-")).toBe(true);
    expect(id.value).not.toMatch(/^0x/);
  });

  it("is deterministic for a given random/clock source (fully testable, no hidden environment dependency)", () => {
    const a = generateTransactionIdentifier(
      () => 0.5,
      () => 1000,
    );
    const b = generateTransactionIdentifier(
      () => 0.5,
      () => 1000,
    );

    expect(a.value).toBe(b.value);
  });

  it("produces unique identifiers for different random sources", () => {
    const a = generateTransactionIdentifier(
      () => 0.1,
      () => 1000,
    );
    const b = generateTransactionIdentifier(
      () => 0.9,
      () => 1000,
    );

    expect(a.value).not.toBe(b.value);
  });
});
