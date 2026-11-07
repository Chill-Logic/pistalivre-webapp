import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usersService } from "@/services/api/gestao/users.service";
import type { UserFilters } from "@/types/user";

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersService.list(filters),
    placeholderData: keepPreviousData,
  });
}
