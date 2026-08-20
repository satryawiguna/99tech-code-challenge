import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceFreshnessControl } from "./PriceFreshnessControl";

describe("PriceFreshnessControl", () => {
  it("shows 'Provided price data' wording, never implying live/production market data", () => {
    render(
      <PriceFreshnessControl
        datasetTimestamp={Date.parse("2023-08-29T07:10:52.000Z")}
        isRefreshing={false}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText(/Provided price data/)).toBeInTheDocument();
    expect(screen.queryByText(/live/i)).not.toBeInTheDocument();
  });

  it("calls onRefresh when the refresh button is clicked", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(
      <PriceFreshnessControl datasetTimestamp={null} isRefreshing={false} onRefresh={onRefresh} />,
    );

    await user.click(screen.getByRole("button", { name: /Refresh/ }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("disables the refresh button and changes its label while a refresh is in flight", () => {
    render(<PriceFreshnessControl datasetTimestamp={null} isRefreshing onRefresh={() => {}} />);

    expect(screen.getByRole("button", { name: "Refreshing…" })).toBeDisabled();
  });

  it("ticks the dataset's own age in real time without re-fetching or changing the underlying timestamp", () => {
    vi.useFakeTimers();
    try {
      const datasetTimestamp = Date.parse("2023-08-29T07:10:52.000Z");
      render(
        <PriceFreshnessControl
          datasetTimestamp={datasetTimestamp}
          isRefreshing={false}
          onRefresh={() => {}}
        />,
      );

      const before = screen.getByText(/Provided price data/).textContent;

      act(() => {
        vi.advanceTimersByTime(30_000);
      });

      // At years-old scale, 30s of ticking must not change the dataset's own displayed age.
      expect(screen.getByText(/Provided price data/).textContent).toBe(before);
    } finally {
      vi.useRealTimers();
    }
  });

  it("counts up the client-side 'Refreshed' indicator, separately from the dataset's own age", () => {
    vi.useFakeTimers();
    try {
      render(
        <PriceFreshnessControl
          datasetTimestamp={Date.parse("2023-08-29T07:10:52.000Z")}
          isRefreshing={false}
          onRefresh={() => {}}
        />,
      );

      expect(screen.getByText("Refreshed just updated")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(30_000);
      });

      expect(screen.getByText(/Refreshed 30s ago/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("resets the 'Refreshed' counter back to zero every time a refresh completes", () => {
    vi.useFakeTimers();
    try {
      const { rerender } = render(
        <PriceFreshnessControl datasetTimestamp={null} isRefreshing={false} onRefresh={() => {}} />,
      );

      act(() => {
        vi.advanceTimersByTime(45_000);
      });
      expect(screen.getByText(/Refreshed 45s ago/)).toBeInTheDocument();

      // A refresh starts (isRefreshing: false -> true) ...
      rerender(<PriceFreshnessControl datasetTimestamp={null} isRefreshing onRefresh={() => {}} />);
      // ... and completes (true -> false), which is the reset signal.
      rerender(
        <PriceFreshnessControl datasetTimestamp={null} isRefreshing={false} onRefresh={() => {}} />,
      );

      expect(screen.getByText(/Refreshed just updated/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
