import { describe, expect, it } from "vitest";
import { getTokenDisplayName } from "./tokenMetadata";

describe("getTokenDisplayName", () => {
  it("returns the known display name for a mapped symbol", () => {
    expect(getTokenDisplayName("ETH")).toBe("Ethereum");
    expect(getTokenDisplayName("ATOM")).toBe("Cosmos Hub");
  });

  it("falls back to the symbol itself for an unmapped symbol", () => {
    expect(getTokenDisplayName("TOTALLY_UNKNOWN")).toBe("TOTALLY_UNKNOWN");
  });
});
