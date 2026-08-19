import { QueryClient } from "@tanstack/react-query";

/**
 * Factory rather than a module-level singleton so a later Presentation phase
 * can create one instance per request/app-mount as Next.js requires; this
 * phase only defines the factory, it does not mount a QueryClientProvider.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // The price feed is a manually-refreshed, non-live snapshot (Discovery §14/§16,
        // PRD FR-017/FR-018) — no background polling or focus-triggered refetching.
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
}
