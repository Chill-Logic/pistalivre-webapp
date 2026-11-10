import type { Plan, PlanInput } from "@/types/plan";

/** Display order: active first, then the configured order. */
export function sortPlans(plans: Plan[]) {
  return [...plans].sort(
    (a, b) => Number(b.active) - Number(a.active) || a.sortOrder - b.sortOrder,
  );
}

/** The plan's term as the business says it: "Mensal", "Anual", "28 meses", "Sem prazo fixo". */
export function durationLabel(months: number | null) {
  if (months == null) return "Sem prazo fixo";
  if (months === 1) return "Mensal";
  if (months === 12) return "Anual";
  return `${months} meses`;
}

/** The plan's conditions as short tags. */
export function planConditions(plan: Plan) {
  return [
    plan.noFidelity && "Sem fidelidade",
    plan.renewable && "Renovável",
    plan.ownershipAtEnd && "Veículo fica com o cliente",
  ].filter((value): value is string => Boolean(value));
}

/** The plan as the PUT body (PUT replaces: every field must go). */
export function toPlanInput(plan: Plan): PlanInput {
  return {
    name: plan.name,
    description: plan.description,
    rate: plan.rate,
    ratePeriod: plan.ratePeriod,
    durationMonths: plan.durationMonths,
    renewable: plan.renewable,
    noFidelity: plan.noFidelity,
    ownershipAtEnd: plan.ownershipAtEnd,
    highlights: plan.highlights,
    active: plan.active,
    sortOrder: plan.sortOrder,
  };
}
