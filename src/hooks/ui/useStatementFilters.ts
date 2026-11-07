import { useMemo } from "react";
import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { resolvePeriod } from "@/helpers/statement";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { StatementFilters } from "@/types/statement";

const KEYS = ["periodo", "origem", "de", "ate"] as const;
const SOURCES = ["ASAAS", "INTER"] as const;

export function useStatementFilters() {
  const { values, page, setFilter, setFilters, setPage } = useUrlFilters(KEYS);
  const period = resolvePeriod(values.periodo, {
    start: values.de,
    end: values.ate,
  });

  const filters = useMemo<StatementFilters>(
    () => ({
      start: period.start,
      end: period.end,
      source: pickOption(SOURCES, values.origem) || "ALL",
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [period.start, period.end, values.origem, page],
  );

  return {
    filters,
    period: period.value,
    setPeriod: (value: string) => setFilter("periodo", value),
    /** Free range: both ends at once, so the URL never has half a range. */
    setRange: ({ start, end }: { start: string; end: string }) =>
      setFilters({ de: start, ate: end }),
    setSource: (value: string) => setFilter("origem", value),
    setPage,
  };
}
