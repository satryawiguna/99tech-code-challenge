import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { FetchPriceRecords } from "@/application";
import { createQueryClient } from "../queryClient";
import { usePriceFeedQuery } from "./usePriceFeedQuery";

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>;
}

describe("usePriceFeedQuery", () => {
  it("loads successfully on mount", async () => {
    const fetchPriceRecords: FetchPriceRecords = async () => ({
      ok: true,
      value: [{ currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1600 }],
    });

    const { result } = renderHook(() => usePriceFeedQuery({ fetchPriceRecords }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.priceState.assets[0]?.price.toNumber()).toBe(1600);
    expect(result.current.data?.lastError).toBeNull();
  });

  it("preserves the prior valid prices when a manual refetch fails (recoverable typed result)", async () => {
    const fetchPriceRecords: FetchPriceRecords = vi
      .fn()
      .mockImplementationOnce(async () => ({
        ok: true,
        value: [{ currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1600 }],
      }))
      .mockImplementationOnce(async () => ({
        ok: false,
        error: { code: "NetworkError", message: "simulated failure" },
      }));

    const { result } = renderHook(() => usePriceFeedQuery({ fetchPriceRecords }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.lastError).toBeNull();

    await result.current.refetch();

    await waitFor(() => expect(result.current.data?.lastError).not.toBeNull());
    expect(result.current.data?.lastError?.code).toBe("NetworkError");
    expect(result.current.data?.priceState.assets[0]?.price.toNumber()).toBe(1600);
  });
});
