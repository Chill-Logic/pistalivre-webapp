import { QueryClient } from "@tanstack/react-query";
import { toApiError } from "@/helpers/api-error";

const MAX_RETRIES = 2;

/** Retry only what can succeed on retry: network blips and 5xx, never 4xx. */
function shouldRetry(failureCount: number, error: unknown) {
  const { status } = toApiError(error);
  if (status >= 400 && status < 500) return false;
  return failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});
