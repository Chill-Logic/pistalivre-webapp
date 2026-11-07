import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { authToken } from "@/helpers/auth-token";

/** Drop the token and every cached response (nothing leaks to the next user). */
export function useLogout() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    authToken.clear();
    queryClient.clear();
  }, [queryClient]);
}
