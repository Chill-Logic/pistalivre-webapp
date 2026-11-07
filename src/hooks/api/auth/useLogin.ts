import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { authToken } from "@/helpers/auth-token";
import { authService } from "@/services/api/auth.service";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ token, user }) => {
      // Seed the cache first so the guard sees the user without a refetch.
      queryClient.setQueryData(queryKeys.auth.me(), user);
      authToken.set(token);
    },
  });
}
