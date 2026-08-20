import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

/**
 * jsdom deliberately does not implement HTMLDialogElement's imperative
 * modal methods (showModal/close) — this is a documented jsdom gap, not a
 * real-browser limitation. Minimal polyfill so <dialog>-based components
 * are testable without replacing the native element with a hand-rolled one.
 */
if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
}

/**
 * jsdom does not implement `window.matchMedia` at all (another documented
 * jsdom gap, not a real-browser limitation). Polyfilled to always report
 * "no match" so components guarding on media queries (e.g. prefers-reduced-motion)
 * exercise their default branch under test rather than throwing.
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
