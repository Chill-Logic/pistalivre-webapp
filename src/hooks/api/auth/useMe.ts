import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useAuthToken } from "@/hooks/auth/useAuthToken";
import { authService } from "@/services/api/auth.service";

/** Logged-in user. Only runs when there is a token to validate. */
export function useMe() {
  const token = useAuthToken();
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authService.me,
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
