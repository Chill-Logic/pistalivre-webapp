import { queryKeys } from "@/constants/query-keys";
import type {
  BillingPeriod,
  BillingTimelineEntry,
  RentReconciliation,
} from "@/types/billing";
import type { Charge, RatePeriod } from "@/types/rental";

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

export type ChargeListEntry =
  | { kind: "charge"; charge: Charge }
  | { kind: "waived"; date: string; reason: string | null };

/**
 * The charges in the server's timeline order with the waived days in
 * between. Without a timeline (billing view not loaded) it is just the
 * charges as the API lists them; a charge the timeline does not know yet
 * (just issued) goes first.
 */
export function chargeTimeline(
  charges: Charge[],
  timeline: BillingTimelineEntry[] | undefined,
): ChargeListEntry[] {
  if (!timeline) return charges.map((charge) => ({ kind: "charge", charge }));
  const byId = new Map(charges.map((charge) => [charge.id, charge]));
  const known = new Set<string>();
  const ordered: ChargeListEntry[] = [];
  for (const entry of timeline) {
    if (entry.kind === "waived") {
      ordered.push({ kind: "waived", date: entry.date, reason: entry.reason });
      continue;
    }
    const charge = byId.get(entry.chargeId);
    if (!charge) continue;
    known.add(charge.id);
    ordered.push({ kind: "charge", charge });
  }
  const unknown: ChargeListEntry[] = charges
    .filter((charge) => !known.has(charge.id))
    .map((charge) => ({ kind: "charge", charge }));
  return [...unknown, ...ordered];
}
