import type {
  CalculatorFill,
  CalculatorTerms,
} from "@/components/organisms/partner-contract-calculator";
import type { PartnerCalculatorScenario, PartnerContract } from "@/types/partner";
import { percentInputOf } from "@/utils/percent";
import type { RatePeriod } from "@/types/rental";

/** The contract's current vehicles grouped by rent: where the calculator starts. */
export function calculatorGroupsOf(contract: PartnerContract) {
  const groups = new Map<
    string,
    { count: number; rate: number | null; period: RatePeriod }
  >();
  for (const vehicle of contract.vehicles.filter((v) => !v.leftAt)) {
    const period = (vehicle.offerRatePeriod ?? "WEEKLY") as RatePeriod;
    const key = [vehicle.offerRate ?? "", period].join("|");
    const group = groups.get(key);
    if (group) group.count += 1;
    else groups.set(key, { count: 1, rate: vehicle.offerRate, period });
  }
  return [...groups.values()];
}

/** The contract's terms as the calculator reads them (the form's shape). */
export function calculatorTermsOf(contract: PartnerContract): CalculatorTerms {
  return {
    type: contract.type,
    shareBase: contract.shareBase ?? "",
    sharePercent: percentInputOf(contract.sharePercent),
    adminFeePercent: percentInputOf(contract.adminFeePercent),
    adminFeeFixed: contract.adminFeeFixed,
    payoutMode: contract.payoutMode,
    fixedPayout: contract.fixedPayout,
    maintenanceFeePercent: percentInputOf(contract.maintenanceFeePercent),
    maintenanceMode: contract.maintenanceMode ?? "COST_SHARE",
    payoutFrequency: contract.payoutFrequency,
    costs: contract.costs,
  };
}

/**
 * A scenario in one canonical form (every cost present, numbers or null):
 * what tells "the same scenario" apart from a real change, whichever side
 * (the screen, the server, the assistant) wrote it.
 */
export function scenarioKey(
  scenario: PartnerCalculatorScenario | null | undefined,
): string {
  if (!scenario) return "";
  const n = (v: number | null | undefined) =>
    v === null || v === undefined || !Number.isFinite(v) ? null : Number(v);
  const c = scenario.costs ?? {};
  return JSON.stringify([
    n(scenario.count),
    n(scenario.rate),
    scenario.period ?? null,
    n(scenario.occupancy),
    n(c.maintenance),
    n(c.insurance),
    n(c.tracker),
    n(c.taxes),
    n(c.fines),
  ]);
}

/**
 * The scenario saved on the contract as a calculator fill: its key is the
 * content, so the calculator re-applies it only when it really changed (the
 * assistant adjusted it, or another screen saved it).
 */
export function scenarioFillOf(
  scenario: PartnerCalculatorScenario | null | undefined,
): CalculatorFill | null {
  if (!scenario) return null;
  return {
    key: scenarioKey(scenario),
    count: scenario.count,
    rate: scenario.rate,
    period: scenario.period,
    occupancy: scenario.occupancy,
    costs: scenario.costs,
  };
}
