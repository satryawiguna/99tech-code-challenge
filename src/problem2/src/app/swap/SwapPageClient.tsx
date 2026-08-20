"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/state";
import { SwapTemplate } from "@/presentation/templates";

export function SwapPageClient() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SwapTemplate />
    </QueryClientProvider>
  );
}
