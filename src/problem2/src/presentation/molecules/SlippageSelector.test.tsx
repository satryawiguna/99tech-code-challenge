import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlippageSelector } from "./SlippageSelector";

describe("SlippageSelector", () => {
  it("marks exactly one option as selected", () => {
    render(<SlippageSelector value={0.005} onChange={() => {}} />);

    expect(screen.getByRole("radio", { name: "0.5%" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "0.1%" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "1%" })).not.toBeChecked();
  });

  it("calls onChange with the newly selected value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SlippageSelector value={0.005} onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "1%" }));

    expect(onChange).toHaveBeenCalledWith(0.01);
  });

  it("is keyboard navigable as a radio group", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SlippageSelector value={0.001} onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("radio", { name: "0.1%" })).toHaveFocus();
  });

  it("lays the visible label and the control out on the same row, not stacked", () => {
    const { container } = render(<SlippageSelector value={0.005} onChange={() => {}} />);

    const row = container.querySelector('[role="group"]');
    expect(row).toHaveStyle({ display: "flex" });
    expect(screen.getByText("Max slippage")).toBeInTheDocument();
    // A <legend> would force block-level stacking even inside a flex fieldset — assert it's gone.
    expect(container.querySelector("legend")).not.toBeInTheDocument();
    expect(container.querySelector("fieldset")).not.toBeInTheDocument();
  });
});
