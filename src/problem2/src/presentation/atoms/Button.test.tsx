import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label and applies the requested variant class", () => {
    render(<Button variant="primary">Review swap</Button>);

    const button = screen.getByRole("button", { name: "Review swap" });
    expect(button).toHaveClass("btn-primary");
  });

  it("defaults to type=button so it never accidentally submits a form", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("is keyboard-activatable and calls onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Refresh</Button>);

    await user.tab();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and unclickable when disabled is passed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Insufficient balance
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Insufficient balance" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
