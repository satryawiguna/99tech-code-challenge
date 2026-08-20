import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetSelectorTrigger } from "./AssetSelectorTrigger";

describe("AssetSelectorTrigger", () => {
  it("shows the placeholder when no asset is selected", () => {
    render(
      <AssetSelectorTrigger
        symbol={null}
        placeholder="Select"
        label="Pay asset"
        onClick={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Pay asset" })).toHaveTextContent("Select");
  });

  it("shows the selected symbol", () => {
    render(
      <AssetSelectorTrigger
        symbol="ETH"
        placeholder="Select"
        label="Pay asset"
        onClick={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Pay asset" })).toHaveTextContent("ETH");
  });

  it("opens the selector on click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AssetSelectorTrigger
        symbol="ETH"
        placeholder="Select"
        label="Pay asset"
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pay asset" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("opens the selector via keyboard activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AssetSelectorTrigger
        symbol="ETH"
        placeholder="Select"
        label="Pay asset"
        onClick={onClick}
      />,
    );

    await user.tab();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
