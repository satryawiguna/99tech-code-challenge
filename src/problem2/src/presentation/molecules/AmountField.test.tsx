import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AmountField } from "./AmountField";

function ControlledAmountField({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <AmountField
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      aria-label="Amount to pay"
    />
  );
}

describe("AmountField", () => {
  it("has an accessible label", () => {
    render(<AmountField value="" onChange={() => {}} aria-label="Amount to pay" />);

    expect(screen.getByRole("textbox", { name: "Amount to pay" })).toBeInTheDocument();
  });

  it("sanitizes typed input before calling onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledAmountField onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: "Amount to pay" }), "1.2.3");

    expect(onChange).toHaveBeenLastCalledWith("1.23");
    expect(screen.getByRole("textbox", { name: "Amount to pay" })).toHaveValue("1.23");
  });

  it("associates a validation message via aria-describedby and aria-invalid", () => {
    render(
      <AmountField
        value="5"
        onChange={() => {}}
        aria-label="Amount to pay"
        aria-describedby="pay-amount-error"
        aria-invalid
      />,
    );

    const input = screen.getByRole("textbox", { name: "Amount to pay" });
    expect(input).toHaveAttribute("aria-describedby", "pay-amount-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
