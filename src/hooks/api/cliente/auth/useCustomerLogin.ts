import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { authToken } from "@/helpers/auth-token";
import { customerAuthService } from "@/services/api/cliente/auth.service";

export function useCustomerLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerAuthService.login,
    onSuccess: ({ token, user }) => {
      queryClient.setQueryData(queryKeys.auth.me(), user);
      authToken.set(token);
    },
  });
}
