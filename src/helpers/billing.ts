import { queryKeys } from "@/constants/query-keys";
import type { BillingPeriod, RentReconciliation } from "@/types/billing";
import type { RatePeriod } from "@/types/rental";

/**
 * Cache key of a rental's billing view. Lives under `rentals.all`, so the
 * invalidations that already exist for rentals reach it. `null` = the whole
 * period (the shape every rule write answers).
 */
export function rentalBillingKey(
  rentalId: string,
  period: BillingPeriod | null,
) {
  return [...queryKeys.rentals.all, "billing", rentalId, period] as const;
}

const SUFFIX: Record<RatePeriod, string> = {
  DAILY: "dia",
  WEEKLY: "semana",
  MONTHLY: "mês",
  YEARLY: "ano",
};

/** "por semana" — how the staff says a value ("450 por semana"). */
export function ratePeriodSuffix(period: RatePeriod) {
  return SUFFIX[period] ?? period;
}

const SERIES_HINT: Record<RatePeriod, string> = {
  DAILY: "As próximas seguem dia a dia a partir dela.",
  WEEKLY: "As próximas seguem de 7 em 7 dias a partir dela.",
  MONTHLY: "As próximas caem no mesmo dia dos meses seguintes.",
  YEARLY: "As próximas caem na mesma data dos anos seguintes.",
};

export function rentSeriesHint(period: RatePeriod) {
  return (
    SERIES_HINT[period] ?? "As próximas seguem a periodicidade da locação."
  );
}

const UNIT_NAMES: Record<RatePeriod, [string, string]> = {
  DAILY: ["diária", "diárias"],
  WEEKLY: ["semana", "semanas"],
  MONTHLY: ["mês", "meses"],
  YEARLY: ["ano", "anos"],
};

/** "20 diárias + 3 semanas": what entered the amount due, per period. */
export function cyclesLabel(reconciliation: RentReconciliation) {
  return (
    (Object.entries(reconciliation.cyclesByPeriod) as [RatePeriod, number][])
      .filter(([, count]) => count > 0)
      .map(
        ([period, count]) =>
          `${count} ${UNIT_NAMES[period]?.[count === 1 ? 0 : 1] ?? period}`,
      )
      .join(" + ") || "nada vencido ainda"
  );
}

/** "Semana em curso", "Diária em curso"… */
export function currentCycleName(period: RatePeriod) {
  const name = UNIT_NAMES[period]?.[0] ?? "ciclo";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
