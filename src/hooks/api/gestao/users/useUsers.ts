import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { usersService } from "@/services/api/gestao/users.service";
import type { UserFilters } from "@/types/user";

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useUserList(filters: UserFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.users.all,
    filters,
    fetch: (current) => usersService.list(current),
    isDesktop,
  });
}
