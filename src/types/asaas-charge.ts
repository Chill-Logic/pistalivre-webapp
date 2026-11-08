import type { ChargeAmounts } from "@/types/rental";

/** A customer's charge as it is at Asaas (GET /customers/:id/asaas-charges). */
export type AsaasCharge = {
  /** Asaas id (pay_…). */
  id: string;
  description: string | null;
  value: number;
  /** Calendar dates (yyyy-mm-dd). */
  dueDate: string;
  status: string;
  billingType: string;
  invoiceUrl: string | null;
  paidDate: string | null;
  /** null = made outside the system and not tied to a rental yet. */
  rentalId: string | null;
  /** null = only exists at Asaas (the next sync brings our copy). */
  paymentId: string | null;
  amounts: ChargeAmounts;
};

export type AsaasCharges = { items: AsaasCharge[]; error: string | null };
