import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usersService } from "@/services/api/gestao/users.service";

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.get(id),
  });
}
