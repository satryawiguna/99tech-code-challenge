import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("exposes an accessible status role so assistive tech announces loading", () => {
    render(<Spinner label="Loading price data" />);

    expect(screen.getByRole("status", { name: "Loading price data" })).toBeInTheDocument();
  });
});
