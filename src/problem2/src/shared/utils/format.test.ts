import { describe, expect, it } from "vitest";
import { Decimal } from "@/domain";
import {
  formatDatasetTimestamp,
  formatLastCheckedAge,
  formatPrice,
  formatTokenAmount,
  formatUsd,
} from "./format";

describe("formatTokenAmount", () => {
  it("scales precision with magnitude", () => {
    expect(formatTokenAmount(new Decimal(1234.5))).toBe("1,234.5");
    expect(formatTokenAmount(new Decimal(1))).toBe("1");
    expect(formatTokenAmount(new Decimal(0.0040398))).toBe("0.0040398");
    expect(formatTokenAmount(new Decimal(0.123456789))).toBe("0.123457");
  });

  it("returns 0 for a non-finite amount", () => {
    expect(formatTokenAmount(new Decimal(NaN))).toBe("0");
  });
});

describe("formatUsd", () => {
  it("formats with exactly two decimal places", () => {
    expect(formatUsd(new Decimal(1234.5))).toBe("$1,234.50");
  });

  it("shows a floor indicator for a tiny non-zero value", () => {
    expect(formatUsd(new Decimal(0.001))).toBe("<$0.01");
  });

  it("formats exactly zero as $0.00, not the tiny-value floor", () => {
    expect(formatUsd(new Decimal(0))).toBe("$0.00");
  });
});

describe("formatPrice", () => {
  it("formats prices >= 1 with two decimals", () => {
    expect(formatPrice(new Decimal(1645.9337373737374))).toBe("$1,645.93");
  });

  it("formats small prices with more precision", () => {
    expect(formatPrice(new Decimal(0.3772))).toBe("$0.3772");
    expect(formatPrice(new Decimal(0.0040398))).toBe("$0.00404");
  });
});

describe("formatDatasetTimestamp", () => {
  it("never claims live/production market data — always frames as provided price data", () => {
    const now = Date.parse("2023-08-29T07:11:00.000Z");
    const timestamp = Date.parse("2023-08-29T07:10:52.000Z");

    const label = formatDatasetTimestamp(timestamp, now);

    expect(label).toContain("Provided price data");
    expect(label.toLowerCase()).not.toContain("live");
  });

  it("shows a relative age in seconds, then minutes, then hours", () => {
    const now = Date.parse("2023-08-29T07:11:00.000Z");
    expect(formatDatasetTimestamp(Date.parse("2023-08-29T07:10:58.000Z"), now)).toContain(
      "just updated",
    );
    expect(formatDatasetTimestamp(Date.parse("2023-08-29T07:10:30.000Z"), now)).toContain(
      "30s ago",
    );
    expect(formatDatasetTimestamp(Date.parse("2023-08-29T07:00:00.000Z"), now)).toContain(
      "11m ago",
    );
    expect(formatDatasetTimestamp(Date.parse("2023-08-29T04:11:00.000Z"), now)).toContain("3h ago");
  });

  it("shows days and years for long-stale datasets rather than an unwieldy hour count", () => {
    const now = Date.parse("2026-08-20T00:00:00.000Z");
    expect(formatDatasetTimestamp(Date.parse("2026-08-17T00:00:00.000Z"), now)).toContain("3d ago");
    expect(formatDatasetTimestamp(Date.parse("2023-08-29T07:10:52.000Z"), now)).toContain("3y ago");
  });

  it("handles no data yet without claiming freshness", () => {
    expect(formatDatasetTimestamp(null)).toBe("Provided price data");
  });
});

describe("formatLastCheckedAge", () => {
  it("shows 'Updated just now' immediately after the last check", () => {
    const now = Date.parse("2026-08-20T00:00:00.000Z");
    expect(formatLastCheckedAge(now, now)).toBe("Updated just now");
  });

  it("increments in seconds, then minutes", () => {
    const now = Date.parse("2026-08-20T00:00:00.000Z");
    expect(formatLastCheckedAge(now - 10_000, now)).toBe("Updated 10s ago");
    expect(formatLastCheckedAge(now - 60_000, now)).toBe("Updated 1m ago");
  });

  it("handles no check yet without claiming freshness", () => {
    expect(formatLastCheckedAge(null)).toBe("Updated");
  });
});
