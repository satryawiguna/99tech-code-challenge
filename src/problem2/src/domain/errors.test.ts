import { describe, expect, it } from "vitest";
import { DomainError, invalidAmount, amountExceedsBalance } from "./errors";

describe("DomainError", () => {
  it("carries the error code and is a real Error instance", () => {
    const error = invalidAmount("test message");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe("InvalidAmount");
    expect(error.message).toBe("test message");
  });

  it("uses a distinct code per error factory", () => {
    expect(invalidAmount().code).not.toBe(amountExceedsBalance().code);
  });
});
