import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { initialSwapState, useSwapStore } from "@/state";
import { PortfolioPanel } from "./PortfolioPanel";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1600) };

beforeEach(() => {
  useSwapStore.setState(initialSwapState);
});

describe("PortfolioPanel", () => {
  it("shows an empty state when there are no simulated balances", () => {
    render(<PortfolioPanel assets={[ETH]} onPickHolding={() => {}} />);

    expect(screen.getByText("No simulated balances yet.")).toBeInTheDocument();
  });

  it("lists a held asset with its formatted balance and USD value", () => {
    useSwapStore.setState({ balances: [{ assetSymbol: "ETH", amount: new Decimal(2) }] });

    render(<PortfolioPanel assets={[ETH]} onPickHolding={() => {}} />);

    expect(screen.getByRole("button", { name: /ETH/ })).toBeInTheDocument();
    expect(screen.getAllByText("$3,200.00")).toHaveLength(2); // portfolio total + the single holding's own value
  });

  it("calls onPickHolding with the clicked holding's symbol", async () => {
    const user = userEvent.setup();
    const onPickHolding = vi.fn();
    useSwapStore.setState({ balances: [{ assetSymbol: "ETH", amount: new Decimal(2) }] });

    render(<PortfolioPanel assets={[ETH]} onPickHolding={onPickHolding} />);
    await user.click(screen.getByRole("button", { name: /ETH/ }));

    expect(onPickHolding).toHaveBeenCalledWith("ETH");
  });
});
