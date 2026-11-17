import { useMemo } from "react";
import {
  ANALYSIS_DIMENSION_OPTIONS,
  DEFAULT_ANALYSIS_DIMENSION,
  ORDERED_DIMENSIONS,
  ANALYSIS_SORT_OPTIONS,
} from "@/constants/maintenance-analysis";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type {
  AnalysisDimension,
  AnalysisSort,
  MaintenanceAnalysisFilters,
} from "@/types/maintenance-analysis";
import { isDayString, lastTwelveMonths, todayInBrasilia } from "@/utils/date";

const KEYS = ["por", "de", "ate", "ordem"] as const;

const isDimension = (value: string): value is AnalysisDimension =>
  ANALYSIS_DIMENSION_OPTIONS.some((option) => option.value === value);
const isSort = (value: string): value is AnalysisSort =>
  value === "natural" ||
  ANALYSIS_SORT_OPTIONS.some((option) => option.value === value);

/**
 * Taxa de manutenção in the URL: `?por=` (dimension), `?de=`/`?ate=` (period,
 * last 12 months when absent) and `?ordem=` (the measure of the order/chart).
 */
export function useMaintenanceAnalysisFilters() {
  const { values, setFilter, setFilters } = useUrlFilters(KEYS);
  const fallback = lastTwelveMonths(todayInBrasilia());
  const dimension = isDimension(values.por)
    ? values.por
    : DEFAULT_ANALYSIS_DIMENSION;
  const from = isDayString(values.de) ? values.de : fallback.start;
  const to = isDayString(values.ate) ? values.ate : fallback.end;
  const naturalByDefault = ORDERED_DIMENSIONS.has(dimension);
  const sort: AnalysisSort = isSort(values.ordem)
    ? values.ordem === "natural" && !naturalByDefault
      ? "cost"
      : values.ordem
    : naturalByDefault
      ? "natural"
      : "cost";

  const filters = useMemo<MaintenanceAnalysisFilters>(
    () => ({ dimension, from, to }),
    [dimension, from, to],
  );

  return {
    filters,
    sort,
    setDimension: (next: AnalysisDimension) =>
      // The order of the old cut rarely fits the new one: back to its default.
      setFilters({
        por: next === DEFAULT_ANALYSIS_DIMENSION ? "" : next,
        ordem: "",
      }),
    setPeriod: ({ start, end }: { start: string; end: string }) =>
      setFilters(
        start === fallback.start && end === fallback.end
          ? { de: "", ate: "" }
          : { de: start, ate: end },
      ),
    setSort: (next: AnalysisSort) => setFilter("ordem", next),
  };
}
