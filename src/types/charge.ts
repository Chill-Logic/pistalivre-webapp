import type { Charge } from "@/types/rental";

/** Purposes the staff can issue (catalog key of PAYMENT_PURPOSE_LABELS). */
export type ChargePurpose =
  "CAUTION" | "RENT" | "FINE" | "DAMAGES" | "SETTLEMENT" | "CLAIM" | "OTHER";

export type ChargeMethod = "PIX" | "BOLETO";

/** Body of POST /rentals/:id/charges (dates yyyy-mm-dd). */
export type RentalChargeInput = {
  purpose: ChargePurpose;
  method: ChargeMethod;
  amount: number;
  dueDate: string;
  finePercent?: number;
  interestPercent?: number;
  /** RENT only: the day it refers to, when not the due date. */
  referenceDate?: string;
  /** OTHER only (the others get the standard description). */
  description?: string;
  /** "Emitir mesmo assim" after a DUPLICATE_RENT. */
  confirmDuplicate?: boolean;
};

export type ChargeUpdateInput = { amount: number; dueDate: string };

export type ChargeSettleInput = {
  paidValue: number;
  paidAt: string;
  notifyCustomer?: boolean;
};

export type ChargeSettlementInput = { paidValue: number; paidAt: string };

/** One line of a plan preview (deposit or installments), dates yyyy-mm-dd. */
export type ChargePlanItem = {
  label?: string;
  amount: number;
  dueDate: string;
};

/** GET /rentals/:id/charges/caution-plan: `emitted` = already charged (skipped). */
export type CautionPlanItem = ChargePlanItem & {
  label: string;
  emitted: boolean;
};

export type InstallmentPeriodicity = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

/** Drivers of GET /charges/installment-plan. */
export type InstallmentPlanParams = {
  total: number;
  count: number;
  periodicity: InstallmentPeriodicity;
  firstDueDate: string;
};

/** POST /rentals/:id/charges/caution (items = the preview with edited dates). */
export type CautionChargesInput = {
  method: ChargeMethod;
  finePercent?: number;
  interestPercent?: number;
  items: ChargePlanItem[];
};

/** POST /rentals/:id/charges/installments (OUR installments, N charges). */
export type InstallmentChargesInput = {
  purpose: Exclude<ChargePurpose, "CAUTION">;
  method: ChargeMethod;
  description?: string;
  finePercent?: number;
  interestPercent?: number;
  items: ChargePlanItem[];
};

/**
 * Batch result: 201 (all done or skipped as already charged) or 207 PARTIAL
 * (`failed`). Indexes are positions in the `items` that were sent.
 */
export type ChargeBatchResult = {
  code?: "PARTIAL";
  created: Charge[];
  skipped?: { index: number; dueDate: string }[];
  failed?: { index: number; code: string; message: string }[];
};
