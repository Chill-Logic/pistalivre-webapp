import { useIsFetching, useIsMutating } from "@tanstack/react-query";

/** True while any query or mutation is in flight (drives the top bar). */
export function useIsLoadingAnything() {
  return useIsFetching() + useIsMutating() > 0;
}
