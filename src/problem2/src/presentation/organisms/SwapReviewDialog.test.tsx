import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { initialSwapState, prepareReviewAction, useSwapStore } from "@/state";
import { SwapReviewDialog } from "./SwapReviewDialog";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

function seedReviewedSwap() {
  useSwapStore.setState({
    sourceAsset: ETH,
    destinationAsset: ATOM,
    sourceAmountInput: "1",
    slippage: 0.005,
    balances: [
      { assetSymbol: "ETH", amount: new Decimal(4.2183) },
      { assetSymbol: "ATOM", amount: new Decimal(10) },
    ],
  });
  const result = prepareReviewAction();
  if (!result.ok) throw new Error("expected a valid review");
  return result.value;
}

beforeEach(() => {
  useSwapStore.setState(initialSwapState);
});

describe("SwapReviewDialog", () => {
  it("is not visible when there is no review snapshot", () => {
    render(<SwapReviewDialog />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the confirm state with Pay/Receive/Rate/Minimum received/Slippage — never Price impact or Network fee", async () => {
    seedReviewedSwap();
    render(<SwapReviewDialog />);

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Confirm swap" })).toBeInTheDocument();
    expect(screen.getByText("Rate")).toBeInTheDocument();
    expect(screen.getByText("Minimum received")).toBeInTheDocument();
    expect(screen.getByText("Slippage")).toBeInTheDocument();
    expect(screen.queryByText(/price impact/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/network fee/i)).not.toBeInTheDocument();
  });

  it("closes without executing anything when Cancel is clicked", async () => {
    seedReviewedSwap();
    const user = userEvent.setup();
    render(<SwapReviewDialog />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(useSwapStore.getState().reviewSnapshot).toBeNull();
    expect(useSwapStore.getState().executionPhase).toBe("idle");
  });

  it("walks through confirm -> pending -> success, then resets on 'New swap'", () => {
    vi.useFakeTimers();
    try {
      seedReviewedSwap();
      render(<SwapReviewDialog />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Confirm swap" }));
      });

      // Immediately after clicking, the real execution has already happened in the
      // store, but the dialog must still display the pending state (cosmetic delay).
      expect(screen.getByText("Submitting swap")).toBeInTheDocument();
      expect(useSwapStore.getState().executionPhase).toBe("success");

      act(() => {
        vi.advanceTimersByTime(1200);
      });

      expect(screen.getByText("Swap complete")).toBeInTheDocument();
      expect(screen.getByText(/Simulated transaction/)).toBeInTheDocument();
      expect(screen.getByText(/^SIM-/)).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "New swap" }));
      });

      expect(useSwapStore.getState().reviewSnapshot).toBeNull();
      expect(useSwapStore.getState().executionPhase).toBe("idle");
      expect(useSwapStore.getState().sourceAmountInput).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("ignores Escape while the pending reveal is in progress, so the dialog cannot be dismissed mid-'processing'", () => {
    vi.useFakeTimers();
    try {
      seedReviewedSwap();
      render(<SwapReviewDialog />);

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Confirm swap" }));
      });
      expect(screen.getByText("Submitting swap")).toBeInTheDocument();

      act(() => {
        fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
      });

      expect(screen.getByText("Submitting swap")).toBeInTheDocument();
      expect(useSwapStore.getState().reviewSnapshot).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(screen.getByText("Swap complete")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders the failed state when executionPhase is 'failed', and Close clears the review", () => {
    // The domain-level ExecutionInProgress path (duplicate confirmation) is
    // already covered at the swapActions level (Phase 4) — this only checks
    // that SwapReviewDialog renders a "failed" store state correctly, since
    // this component's own button-hiding makes that path unreachable via
    // real clicks (the Confirm button disappears the instant it's clicked).
    const snapshot = seedReviewedSwap();
    useSwapStore.setState({ reviewSnapshot: snapshot, executionPhase: "failed" });

    render(<SwapReviewDialog />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Swap failed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(useSwapStore.getState().reviewSnapshot).toBeNull();
  });
});
