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
  items: CustomerDebt[];
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
