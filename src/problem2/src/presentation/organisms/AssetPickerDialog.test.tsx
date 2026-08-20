import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { AssetPickerDialog } from "./AssetPickerDialog";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

describe("AssetPickerDialog", () => {
  it("is not visible when closed", () => {
    render(
      <AssetPickerDialog
        open={false}
        title="Pay with"
        assets={[ETH, ATOM]}
        balancesBySymbol={{}}
        otherSymbol={null}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and focuses the search field", async () => {
    render(
      <AssetPickerDialog
        open
        title="Pay with"
        assets={[ETH, ATOM]}
        balancesBySymbol={{}}
        otherSymbol={null}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("searchbox", { name: "Search assets" })).toHaveFocus();
  });

  it("lists every priced asset when the search is empty", async () => {
    render(
      <AssetPickerDialog
        open
        title="Pay with"
        assets={[ETH, ATOM]}
        balancesBySymbol={{}}
        otherSymbol={null}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /ETH/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ATOM/ })).toBeInTheDocument();
  });

  it("filters by symbol", async () => {
    const user = userEvent.setup();
    render(
      <AssetPickerDialog
        open
        title="Pay with"
        assets={[ETH, ATOM]}
        balancesBySymbol={{}}
        otherSymbol={null}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    await user.type(screen.getByRole("searchbox", { name: "Search assets" }), "eth");

    expect(screen.getByRole("button", { name: /ETH/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ATOM/ })).not.toBeInTheDocument();
  });

  it("filters by display name (FR-006)", async () => {
    const user = userEvent.setup();
    render(
      <AssetPickerDialog
        open
        title="Pay with"
        assets={[ETH, ATOM]}
        balancesBySymbol={{}}
        otherSymbol={null}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    await user.type(screen.getByRole("searchbox", { name: "Search assets" }), "ethereum");

    expect(screen.getByRole("button", { name: /ETH/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ATOM/ })).not.toBeInTheDocument();
  });

  it("shows an empty state when the search matches nothing", async () => {
    const user = userEvent.setup();
    render(
      <AssetPickerDialog
        open
        title="Pay with"
        assets={[ETH, ATOM]}
        balancesBySymbol={{}}
        otherSymbol={null}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    await user.type(screen.getByRole("searchbox", { name: "Search assets" }), "zzz");

    expect(screen.getByText(/No priced asset matches/)).toBeInTheDocument();
  });

  it("calls onSelect with the chosen symbol", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <AssetPickerDialog
        open
        title="Pay with"
        assets={[ETH, ATOM]}
        balancesBySymbol={{}}
        otherSymbol={null}
        onSelect={onSelect}
        onClose={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /ETH/ }));

    expect(onSelect).toHaveBeenCalledWith("ETH");
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AssetPickerDialog
        open
        title="Pay with"
        assets={[ETH, ATOM]}
        balancesBySymbol={{}}
        otherSymbol={null}
        onSelect={() => {}}
        onClose={onClose}
      />,
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalled();
  });
});
