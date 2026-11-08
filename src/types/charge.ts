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
