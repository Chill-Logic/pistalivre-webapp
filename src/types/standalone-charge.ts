import type { ChargeMethod, ChargePurpose } from "@/types/charge";
import type { Charge } from "@/types/rental";

/**
 * POST /charges: a charge issued from the Financeiro or the customer record
 * (customer required, rental optional). One charge (`amount` + `dueDate`)
 * or installments (`items`).
 */
export type StandaloneChargeInput = {
  customerId: string;
  rentalId?: string;
  purpose: ChargePurpose;
  method: ChargeMethod;
  description?: string;
  finePercent?: number;
  interestPercent?: number;
  amount?: number;
  dueDate?: string;
  items?: { amount: number; dueDate: string; label?: string }[];
};

/** 201 `{ created }` or 207 PARTIAL with what failed (index in `items`). */
export type StandaloneChargeResult = {
  code?: "PARTIAL";
  created: Charge[];
  failed?: { index: number; code: string; message: string }[];
};

/**
 * POST /charges/manual: a payment that did NOT go through Asaas (pix straight
 * to our account). `amount`/`dueDate` = what and when it was owed; with
 * `settled` it is born received, else it stays open for a later "Dar baixa".
 */
export type ManualChargeInput = {
  customerId: string;
  rentalId?: string;
  purpose: ChargePurpose;
  method: ChargeMethod;
  amount: number;
  dueDate: string;
  label?: string;
  settled: boolean;
  paidValue?: number;
  paidAt?: string;
};

/** POST /finance/sync. */
export type FinanceSyncResult = {
  imported: number;
  updated: number;
  skipped: number;
};
