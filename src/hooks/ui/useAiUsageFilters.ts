import { useMemo } from "react";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { AiUsageFilters } from "@/types/ai-usage";
import { currentMonth, isMonthKey } from "@/utils/month";

const KEYS = ["mes"] as const;

/** Month (`?mes=`, this month when absent) + paging, in the URL. */
export function useAiUsageFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } = useUrlFilters(KEYS);
  const now = currentMonth();
  const month = isMonthKey(values.mes) ? values.mes : now;
  const filters = useMemo<AiUsageFilters>(
    () => ({ month, page, pageSize }),
    [month, page, pageSize],
  );
  return {
    filters,
    setMonth: (next: string) => setFilter("mes", next === now ? "" : next),
    setPage,
    setPageSize,
  };
}
