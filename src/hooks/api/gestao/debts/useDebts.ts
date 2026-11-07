import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { debtsService } from "@/services/api/gestao/debts.service";
import type { DebtFilters } from "@/types/debt";

/**
 * Debts page: numbered pages on the desktop, 10 by 10 on the phone. The
 * summary (all debts, whatever the page) comes on `firstPage`.
 */
export function useDebtList(filters: DebtFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.debts.all,
    filters,
    fetch: (current) => debtsService.list(current),
    isDesktop,
  });
}
