import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MatrixRainBackground } from "./MatrixRainBackground";

describe("MatrixRainBackground", () => {
  it("renders a non-interactive, decorative canvas without crashing", () => {
    // jsdom has no real 2D canvas context (getContext returns null), which
    // exercises the component's own guard — this proves it degrades safely
    // rather than throwing when canvas isn't actually available.
    const { container } = render(<MatrixRainBackground />);

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveStyle({ pointerEvents: "none" });
  });
});
