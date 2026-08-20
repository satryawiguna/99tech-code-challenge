import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceFreshnessControl } from "./PriceFreshnessControl";

describe("PriceFreshnessControl", () => {
  it("shows the last-checked clock without claiming live/production market data", () => {
    render(
      <PriceFreshnessControl
        datasetTimestamp={Date.parse("2023-08-29T07:10:52.000Z")}
        lastCheckedAt={Date.parse("2026-08-20T00:00:00.000Z")}
        isRefreshing={false}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.queryByText(/live/i)).not.toBeInTheDocument();
  });

  it("calls onRefresh when the refresh button is clicked", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(
      <PriceFreshnessControl
        datasetTimestamp={null}
        lastCheckedAt={Date.now()}
        isRefreshing={false}
        onRefresh={onRefresh}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Refresh/ }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("disables the refresh button and changes its label while a refresh is in flight", () => {
    render(
      <PriceFreshnessControl
        datasetTimestamp={null}
        lastCheckedAt={Date.now()}
        isRefreshing
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Refreshing…" })).toBeDisabled();
  });

  it("ticks the last-checked clock in real time", () => {
    vi.useFakeTimers();
    try {
      const lastCheckedAt = Date.parse("2026-08-20T00:00:00.000Z");
      vi.setSystemTime(lastCheckedAt);
      render(
        <PriceFreshnessControl
          datasetTimestamp={Date.parse("2023-08-29T07:10:52.000Z")}
          lastCheckedAt={lastCheckedAt}
          isRefreshing={false}
          onRefresh={() => {}}
        />,
      );

      expect(screen.getByText(/Updated/).textContent).toBe("Updated just now");

      act(() => {
        vi.advanceTimersByTime(10_000);
      });

      expect(screen.getByText(/Updated/).textContent).toBe("Updated 10s ago");
    } finally {
      vi.useRealTimers();
    }
  });

  it("resets the clock when a refresh completes with a newer lastCheckedAt", () => {
    vi.useFakeTimers();
    try {
      const first = Date.parse("2026-08-20T00:00:00.000Z");
      vi.setSystemTime(first);
      const { rerender } = render(
        <PriceFreshnessControl
          datasetTimestamp={Date.parse("2023-08-29T07:10:52.000Z")}
          lastCheckedAt={first}
          isRefreshing={false}
          onRefresh={() => {}}
        />,
      );

      act(() => {
        vi.advanceTimersByTime(30_000);
      });
      expect(screen.getByText(/Updated/).textContent).toBe("Updated 30s ago");

      const refreshedAt = first + 30_000;
      vi.setSystemTime(refreshedAt);
      rerender(
        <PriceFreshnessControl
          datasetTimestamp={Date.parse("2023-08-29T07:10:52.000Z")}
          lastCheckedAt={refreshedAt}
          isRefreshing={false}
          onRefresh={() => {}}
        />,
      );

      expect(screen.getByText(/Updated/).textContent).toBe("Updated just now");
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the provided source-data timestamp available as a tooltip", () => {
    render(
      <PriceFreshnessControl
        datasetTimestamp={Date.parse("2023-08-29T07:10:52.000Z")}
        lastCheckedAt={Date.now()}
        isRefreshing={false}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText(/Updated/).getAttribute("title")).toContain(
      "Provided price data · source",
    );
  });
});
