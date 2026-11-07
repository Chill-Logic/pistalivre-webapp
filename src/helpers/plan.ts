import type { Plan } from "@/types/plan";

/** Display order: active first, then the configured order. */
export function sortPlans(plans: Plan[]) {
  return [...plans].sort(
    (a, b) => Number(b.active) - Number(a.active) || a.sortOrder - b.sortOrder,
  );
}

/** "12 meses" / "1 mês" / "Sem prazo fixo". */
export function durationLabel(months: number | null) {
  if (months == null) return "Sem prazo fixo";
  return `${months} ${months === 1 ? "mês" : "meses"}`;
}

/** The plan's conditions as short tags. */
export function planConditions(plan: Plan) {
  return [
    plan.noFidelity && "Sem fidelidade",
    plan.renewable && "Renovável",
    plan.ownershipAtEnd && "Veículo fica com o cliente",
  ].filter((value): value is string => Boolean(value));
}
