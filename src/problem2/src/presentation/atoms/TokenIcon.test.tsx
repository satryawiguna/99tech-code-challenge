import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { TokenIcon } from "./TokenIcon";

function renderIcon(symbol: string) {
  const { container } = render(<TokenIcon symbol={symbol} />);
  const img = container.querySelector("img");
  if (!img) throw new Error("expected an <img> to render");
  return img;
}

function renderIconWithWrapper(symbol: string) {
  const { container } = render(<TokenIcon symbol={symbol} />);
  const wrapper = container.querySelector(".token-icon");
  const img = container.querySelector("img");
  if (!wrapper || !img) throw new Error("expected a wrapper and an <img> to render");
  return { wrapper, img };
}

describe("TokenIcon", () => {
  it("resolves the exact-match icon path for a known symbol", () => {
    expect(renderIcon("ETH")).toHaveAttribute("src", "/tokens/ETH.svg");
  });

  it("renders as decorative (empty alt) since the symbol is always shown as adjacent text", () => {
    expect(renderIcon("ETH")).toHaveAttribute("alt", "");
  });

  it("resolves the known casing alias for a feed symbol without an exact-match file", () => {
    expect(renderIcon("STATOM")).toHaveAttribute("src", "/tokens/stATOM.svg");
  });

  it("falls back to the generic placeholder for a completely unknown symbol", () => {
    expect(renderIcon("TOTALLY_UNKNOWN")).toHaveAttribute("src", "/tokens/_fallback.svg");
  });

  it("swaps to the fallback if the resolved image fails to load at runtime", () => {
    const img = renderIcon("ETH");

    fireEvent.error(img);

    expect(img).toHaveAttribute("src", "/tokens/_fallback.svg");
  });

  it("plays a decorative flip animation on hover and reverses it on hover-out", () => {
    const { wrapper, img } = renderIconWithWrapper("ETH");

    expect(img.style.transform).toBe("rotateY(0deg)");

    fireEvent.mouseEnter(wrapper);
    expect(img.style.transform).toBe("rotateY(360deg)");

    fireEvent.mouseLeave(wrapper);
    expect(img.style.transform).toBe("rotateY(0deg)");
  });
});
