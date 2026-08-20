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

  it("does not reset or add a separate counter when a refresh completes — the dataset age is the only indicator shown", () => {
    vi.useFakeTimers();
    try {
      const datasetTimestamp = Date.parse("2023-08-29T07:10:52.000Z");
      const { rerender } = render(
        <PriceFreshnessControl
          datasetTimestamp={datasetTimestamp}
          isRefreshing={false}
          onRefresh={() => {}}
        />,
      );

      const before = screen.getByText(/Provided price data/).textContent;

      // A refresh starts (isRefreshing: false -> true) and completes (true -> false).
      rerender(
        <PriceFreshnessControl
          datasetTimestamp={datasetTimestamp}
          isRefreshing
          onRefresh={() => {}}
        />,
      );
      rerender(
        <PriceFreshnessControl
          datasetTimestamp={datasetTimestamp}
          isRefreshing={false}
          onRefresh={() => {}}
        />,
      );

      expect(screen.getByText(/Provided price data/).textContent).toBe(before);
      expect(screen.queryByText(/refreshed/i)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
