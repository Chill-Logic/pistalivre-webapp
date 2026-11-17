import { routeTo } from "@/constants/routes";
import type { BarItem } from "@/types/chart";
import type {
  AnalysisMeasures,
  AnalysisRow,
  AnalysisSort,
} from "@/types/maintenance-analysis";
import { formatCurrency, formatInteger } from "@/utils/format";
import { formatPercent } from "@/utils/percent";

type Measure = Exclude<AnalysisSort, "natural">;

const MONTHS = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** The number a measure reads on a row (null = no denominator). */
export function measureOf(
  row: AnalysisMeasures,
  measure: Measure,
): number | null {
  return row[measure];
}

/** A measure written out ("R$ 34,17", "9,3%", "—"). */
export function formatMeasure(value: number | null, measure: Measure): string {
  if (value == null) return "—";
  if (measure === "count") return formatInteger(value);
  if (measure === "revenueShare") return formatPercent(value);
  return formatCurrency(value);
}

/** "39,1 meses de moto". */
export function formatFleetMonths(months: number) {
  return `${MONTHS.format(months)} ${months === 1 ? "mês" : "meses"} de moto`;
}

/** "8.050 km". */
export function formatKm(km: number) {
  return `${formatInteger(km)} km`;
}

/**
 * Rows in the chosen order: "natural" keeps the server's (month, tenure…);
 * a measure goes biggest first, rows without it at the end.
 */
export function sortAnalysisRows(rows: AnalysisRow[], sort: AnalysisSort) {
  if (sort === "natural") return rows;
  return [...rows].sort((a, b) => {
    const x = measureOf(a, sort);
    const y = measureOf(b, sort);
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    return y - x;
  });
}

/** The chart: up to `limit` rows on the chosen measure (cost when natural). */
export function analysisBarItems(
  rows: AnalysisRow[],
  sort: AnalysisSort,
  limit = 10,
): BarItem[] {
  const measure: Measure = sort === "natural" ? "cost" : sort;
  return rows
    .filter((row) => (measureOf(row, measure) ?? 0) > 0)
    .slice(0, limit)
    .map((row) => {
      const value = measureOf(row, measure) ?? 0;
      return {
        key: row.key,
        label: row.detail ? `${row.label} · ${row.detail}` : row.label,
        value,
        display: formatMeasure(value, measure),
      };
    });
}

/** Where the row's own record lives (vehicle, customer, rental). */
export function analysisRowPath(row: AnalysisRow): string | null {
  if (!row.link) return null;
  if (row.link.kind === "vehicle") return routeTo.vehicle(row.link.id);
  if (row.link.kind === "customer") return routeTo.customer(row.link.id);
  return routeTo.rental(row.link.id);
}

/** "km medido em 1 de 13 motos" (the R$/km reads only there). */
export function kmCoverageHint(coverage: { vehicles: number; withKm: number }) {
  if (coverage.withKm === 0) return "Nenhuma moto com km medido no período";
  return `km medido em ${coverage.withKm} de ${coverage.vehicles} ${coverage.vehicles === 1 ? "moto" : "motos"}`;
}
