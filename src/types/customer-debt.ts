import type { DocumentFile } from "@/types/document";

export type CustomerDebtOrigin =
  "CLAIM" | "DAMAGES" | "TRAFFIC_FINE" | "SETTLEMENT" | "OTHER";

/** What a customer owes the company outside charges (damages, fines…). */
export type CustomerDebt = {
  id: string;
  origin: CustomerDebtOrigin;
  /** Shown to the customer. */
  description: string | null;
  amount: number;
  /** Calendar dates. */
  incurredAt: string;
  startsAt: string;
  /** Internal note. */
  notes: string | null;
  paidFromRent: number;
  paidDirect: number;
  balance: number;
  settledAt: string | null;
  payments: {
    id: string;
    amount: number;
    paidAt: string;
    notes: string | null;
  }[];
  documents: DocumentFile[];
  /** "~N semanas para quitar": only the first open debt of the queue. */
  weeksToPayOff?: number | null;
  /** The ended rental whose open rent became this debt (null = by hand). */
  transferredFrom?: { rentalId: string; code: string } | null;
};

/**
 * Open rent of an ENDED rental — computed from its ledger, never stored:
 * paying on the rental lowers it by itself.
 */
export type RentBalance = {
  rentalId: string;
  code: string;
  endDate: string | null;
  balance: number;
};

/**
 * GET /customers/:id/debts — every write answers this same view. The debts
 * form a queue: the oldest open one is paid down first by the daily rent.
 */
export type CustomerDebtsView = {
  customerId: string;
  totalBalance: number;
  /** Part of the rent set aside for debts, per week (0 = none). */
  weeklyShare: number;
  /** Debts + the open rent of ended rentals. */
  totalOwed?: number;
  rentBalances?: RentBalance[];
  items: CustomerDebt[];
};

export type TransferRentBalanceInput = {
  /** yyyy-mm-dd: the new debt is paid down from this day. */
  startsAt: string;
  notes: string | null;
};

export type CustomerDebtInput = {
  origin: CustomerDebtOrigin;
  description: string | null;
  amount: number;
  incurredAt: string;
  startsAt: string;
  notes: string | null;
};

export type CustomerDebtPaymentInput = {
  amount: number;
  paidAt: string;
  notes: string | null;
};
