import type { PartnerContract } from "@/types/partner";
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
