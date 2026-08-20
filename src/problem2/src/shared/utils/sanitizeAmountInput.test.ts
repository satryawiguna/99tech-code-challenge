import { describe, expect, it } from "vitest";
import { sanitizeAmountInput } from "./sanitizeAmountInput";

describe("sanitizeAmountInput", () => {
  it("passes through a valid decimal", () => {
    expect(sanitizeAmountInput("1.5")).toBe("1.5");
  });

  it("strips non-numeric characters", () => {
    expect(sanitizeAmountInput("1a2b.5c")).toBe("12.5");
  });

  it("keeps only the first decimal point", () => {
    expect(sanitizeAmountInput("1.2.3")).toBe("1.23");
  });

  it("prefixes a leading dot with 0", () => {
    expect(sanitizeAmountInput(".5")).toBe("0.5");
  });

  it("strips leading zeros while typing a whole number", () => {
    expect(sanitizeAmountInput("01")).toBe("1");
  });

  it("does not strip a single leading zero before a decimal point", () => {
    expect(sanitizeAmountInput("0.5")).toBe("0.5");
  });

  it("returns an empty string for empty input", () => {
    expect(sanitizeAmountInput("")).toBe("");
  });
});
