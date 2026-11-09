import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import { currentMonth, isMonthKey } from "@/utils/month";

const KEYS = ["mes"] as const;

/** The month on screen, in the URL (`?mes=2026-10`); this month when absent. */
export function useExpenseMonthFilter() {
  const { values, setFilter } = useUrlFilters(KEYS);
  const now = currentMonth();
  const month = isMonthKey(values.mes) ? values.mes : now;
  return {
    month,
    setMonth: (next: string) => setFilter("mes", next === now ? "" : next),
  };
}
