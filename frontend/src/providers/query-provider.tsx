"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep data fresh for 30 seconds before revalidating in the background
            staleTime: 30 * 1000,
            // Retry failed requests less aggressively
            retry: 1,
            // Keep fetched data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Don't refetch automatically on window focus unless stale
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
