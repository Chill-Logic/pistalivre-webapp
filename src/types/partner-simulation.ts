import type { RatePeriod } from "@/types/rental";

export type PartnerCostKey =
  "maintenance" | "insurance" | "tracker" | "taxes" | "fines";
export type PartnerCostPayerCode = "COMPANY" | "PARTNER" | "RENTER";

/** POST /partner-contracts/simulate (the calculator beside the contract form). */
export type PartnerSimulationInput = {
  type: "INVESTMENT" | "MANAGEMENT";
  shareBase: "REVENUE" | "PROFIT" | null;
  sharePercent: number | null;
  adminFeePercent: number | null;
  adminFeeFixed: number | null;
  payoutMode: "SHARE" | "FIXED";
  fixedPayout: number | null;
  maintenanceFeePercent: number | null;
  payoutFrequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  costs: Record<PartnerCostKey, PartnerCostPayerCode>;
  vehicles: { count: number; rate: number; ratePeriod: RatePeriod }[];
  occupancyPercent: number;
  /** Per vehicle per month. */
  monthlyCosts: Record<PartnerCostKey, number>;
};

export type PartnerSimulation = {
  vehicleCount: number;
  revenue: number;
  costs: {
    cost: PartnerCostKey;
    amount: number;
    payer: PartnerCostPayerCode;
  }[];
  costsByPayer: Record<PartnerCostPayerCode, number>;
  base: number;
  adminFee: number;
  /** Fixed payout: the maintenance fee withheld from it (0 otherwise). */
  maintenanceFee: number;
  partnerGross: number;
  partnerNet: number;
  companyNet: number;
  payoutsPerMonth: number;
  partnerPerPayout: number;
};
