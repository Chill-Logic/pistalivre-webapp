import { useMemo } from "react";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { DebtFilters } from "@/types/debt";

const KEYS = [] as const;

/** Only paging for now (page/size in the URL). */
export function useDebtFilters() {
  const { page, pageSize, setPage, setPageSize } = useUrlFilters(KEYS);
  const filters = useMemo<DebtFilters>(
    () => ({ page, pageSize }),
    [page, pageSize],
  );
  return { filters, setPage, setPageSize };
}
