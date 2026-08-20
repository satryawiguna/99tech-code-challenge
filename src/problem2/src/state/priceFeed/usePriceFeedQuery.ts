"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { FetchPriceRecords } from "@/application";
import { fetchPriceFeedQueryData } from "./fetchPriceFeedQueryData";
import type { PriceFeedQueryData } from "./fetchPriceFeedQueryData";
import { createPriceFeedPort } from "./priceFeedPort";
import { priceFeedQueryKey } from "./priceFeedQueryKey";

export interface UsePriceFeedQueryOptions {
  /** Overridable for testing; defaults to the real Infrastructure-backed port. */
  readonly fetchPriceRecords?: FetchPriceRecords;
}

/**
 * Thin React binding over `fetchPriceFeedQueryData`: the first fetch loads,
 * every subsequent fetch (including a manual `refetch()` from the returned
 * query result) refreshes with the last resolved data as the fallback.
 * Contains no calculation, validation, or business logic itself.
 */
export function usePriceFeedQuery(
  options: UsePriceFeedQueryOptions = {},
): UseQueryResult<PriceFeedQueryData> {
  const fetchPriceRecords = options.fetchPriceRecords ?? createPriceFeedPort();
  const previousRef = useRef<PriceFeedQueryData | null>(null);

  return useQuery({
    queryKey: priceFeedQueryKey,
    queryFn: async () => {
      const data = await fetchPriceFeedQueryData({
        fetchPriceRecords,
        previous: previousRef.current,
      });
      previousRef.current = data;
      return data;
    },
  });
}
