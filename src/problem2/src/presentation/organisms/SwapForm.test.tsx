import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { initialSwapState, useSwapStore } from "@/state";
import { SwapForm } from "./SwapForm";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };
const ASSETS = [ETH, ATOM];

beforeEach(() => {
  useSwapStore.setState(initialSwapState);
});

function renderForm() {
  return render(<SwapForm assets={ASSETS} />);
}

describe("SwapForm — states", () => {
  it("prompts asset selection before anything is chosen", () => {
    renderForm();

    expect(screen.getByRole("alert")).toHaveTextContent("Select an asset to pay with.");
    expect(screen.getByRole("button", { name: "Select an asset" })).toBeDisabled();
  });

  it("renders a ready quote when both assets and a valid amount are set", () => {
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    renderForm();

    expect(screen.getByRole("button", { name: "Review swap" })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an insufficient-balance notice and disables the CTA", () => {
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "5",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    renderForm();

    expect(screen.getByRole("alert")).toHaveTextContent("Insufficient ETH balance");
    expect(screen.getByRole("alert")).toHaveTextContent("4.2183 ETH");
    expect(screen.getByRole("button", { name: "Insufficient ETH balance" })).toBeDisabled();
  });

  it("prevents a same-asset swap", () => {
    useSwapStore.setState({ sourceAsset: ETH, destinationAsset: ETH, sourceAmountInput: "1" });

    renderForm();

    expect(screen.getByRole("alert")).toHaveTextContent("Choose two different assets to swap.");
    expect(screen.getByRole("button", { name: "Select a different asset" })).toBeDisabled();
  });

  it("associates the validation notice with the amount field for assistive tech", () => {
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "5",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    renderForm();

    const input = screen.getByRole("textbox", { name: "Amount to pay" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("Insufficient ETH balance");
  });

  it("never renders price impact or network fee anywhere", () => {
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    renderForm();

    expect(screen.queryByText(/price impact/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/network fee/i)).not.toBeInTheDocument();
  });

  it("never implies the price feed is live/production market data", () => {
    useSwapStore.setState({ sourceAsset: ETH, destinationAsset: ATOM, sourceAmountInput: "1" });

    renderForm();

    // The freshness label itself now lives in the header (PriceFreshnessControl); this only
    // guards against SwapForm's own copy ever reintroducing "live" wording.
    expect(screen.queryByText(/live/i)).not.toBeInTheDocument();
  });
});

describe("SwapForm — HALF / MAX / reverse", () => {
  it("HALF sets the amount to half the source balance and recalculates the quote", async () => {
    const user = userEvent.setup();
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4) }],
    });

    renderForm();
    await user.click(screen.getByRole("button", { name: "HALF" }));

    expect(screen.getByRole("textbox", { name: "Amount to pay" })).toHaveValue("2");
  });

  it("MAX sets the amount to the full source balance", async () => {
    const user = userEvent.setup();
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4) }],
    });

    renderForm();
    await user.click(screen.getByRole("button", { name: "MAX" }));

    expect(screen.getByRole("textbox", { name: "Amount to pay" })).toHaveValue("4");
  });

  it("reverse swaps the source/destination assets and carries the receive amount forward", async () => {
    const user = userEvent.setup();
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      balances: [
        { assetSymbol: "ETH", amount: new Decimal(4.2183) },
        { assetSymbol: "ATOM", amount: new Decimal(1000) },
      ],
    });

    renderForm();
    await user.click(screen.getByRole("button", { name: "Reverse the swap direction" }));

    expect(screen.getByRole("button", { name: "Choose the asset you pay with" })).toHaveTextContent(
      "ATOM",
    );
    expect(screen.getByRole("button", { name: "Choose the asset you receive" })).toHaveTextContent(
      "ETH",
    );
  });
});

describe("SwapForm — rate invert and slippage", () => {
  it("toggles between the rate and its inverse", async () => {
    const user = userEvent.setup();
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    renderForm();
    expect(screen.getByText(/^1 ETH =/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^1 ETH =/ }));

    expect(screen.getByText(/^1 ATOM =/)).toBeInTheDocument();
  });

  it("changing slippage recalculates minimum received", async () => {
    const user = userEvent.setup();
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    renderForm();
    const before = screen.getByText(/Minimum received/).nextSibling?.textContent;

    await user.click(screen.getByRole("radio", { name: "1%" }));

    const after = screen.getByText(/Minimum received/).nextSibling?.textContent;
    expect(after).not.toBe(before);
  });
});

describe("SwapForm — asset selector", () => {
  it("opens the pay selector and selects an asset", async () => {
    const user = userEvent.setup();
    useSwapStore.setState({
      destinationAsset: ATOM,
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    renderForm();
    await user.click(screen.getByRole("button", { name: "Choose the asset you pay with" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /ETH/ }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Choose the asset you pay with" })).toHaveTextContent(
      "ETH",
    );
  });

  it("swaps sides when picking the asset already selected on the other side", async () => {
    const user = userEvent.setup();
    useSwapStore.setState({ sourceAsset: ETH, destinationAsset: ATOM });

    renderForm();
    await user.click(screen.getByRole("button", { name: "Choose the asset you receive" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /^ETH/ }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Choose the asset you receive" })).toHaveTextContent(
      "ETH",
    );
    expect(screen.getByRole("button", { name: "Choose the asset you pay with" })).toHaveTextContent(
      "ATOM",
    );
  });

  it("does not clear the pay side when the same asset is picked for receive before receive was ever set", async () => {
    const user = userEvent.setup();
    useSwapStore.setState({ sourceAsset: ETH, destinationAsset: null });

    renderForm();
    await user.click(screen.getByRole("button", { name: "Choose the asset you receive" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /^ETH/ }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    // Pay must still hold ETH — the "swap sides" shortcut must not fire (and null out
    // pay) when receive had no prior asset to swap in the first place. Picking the same
    // asset for both sides is a legitimate same-asset selection, which surfaces Domain's
    // own SameAssetSwap validation instead.
    expect(screen.getByRole("button", { name: "Choose the asset you pay with" })).toHaveTextContent(
      "ETH",
    );
    expect(screen.getByRole("button", { name: "Choose the asset you receive" })).toHaveTextContent(
      "ETH",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Choose two different assets to swap.");
  });
});
