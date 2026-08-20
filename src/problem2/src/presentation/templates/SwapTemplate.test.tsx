import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient, initialSwapState, useSwapStore } from "@/state";
import { SwapTemplate } from "./SwapTemplate";

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>;
}

function fakeResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

beforeEach(() => {
  useSwapStore.setState(initialSwapState);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SwapTemplate", () => {
  it("shows a loading state before price data resolves", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    render(<SwapTemplate />, { wrapper });

    expect(screen.getByRole("status", { name: "Loading price data" })).toBeInTheDocument();
  });

  it("shows an error state with retry when the very first load fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    render(<SwapTemplate />, { wrapper });

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Unable to load market prices."),
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders the ready swap form once price data loads, and seeds simulated balances", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        fakeResponse([
          { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.9337373737374 },
          { currency: "ATOM", date: "2023-08-29T07:10:00.000Z", price: 7.1573 },
        ]),
      ),
    );

    render(<SwapTemplate />, { wrapper });

    await waitFor(() => expect(screen.getByText(/Swap assets/)).toBeInTheDocument());
    await waitFor(() => expect(useSwapStore.getState().balances.length).toBeGreaterThan(0));
  });
});
