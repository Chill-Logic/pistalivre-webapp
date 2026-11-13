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
  maintenanceMode: "COST_SHARE" | "COST_PLUS_FEE" | null;
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
  /** Fixed payout: the owner's part of the month's maintenance, off the payout (0 otherwise). */
  maintenanceFee: number;
  /** Fixed payout: what the shop cost in the month (the company pays it). */
  maintenanceCost: number;
  /** Fixed payout: deductions above the payout, carried to the next one. */
  carryOver: number;
  /** The owner's costs that come off their part (fixed payout: without the taxes they pay directly). */
  partnerDeductions: number;
  partnerGross: number;
  partnerNet: number;
  companyNet: number;
  payoutsPerMonth: number;
  partnerPerPayout: number;
};
