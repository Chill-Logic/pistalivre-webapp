import type { Conversion, Currency, ExpensePaymentMethod } from "@/types/currency";
import type { DocumentFile } from "@/types/document";
import type { PaymentCardRef } from "@/types/payment-card";
import type { SupplierBilling, SupplierScope } from "@/types/supplier";

/** What happened to a month's bill. PARTIAL only on a debt installment. */
export type ExpenseStatus = "OPEN" | "PAID" | "WAIVED";
export type MonthItemStatus = ExpenseStatus | "PARTIAL";
export type MonthItemKind = "FIXED" | "DEBT" | "ONE_OFF";

export type ExpenseVehicle = { id: string; plate: string; label: string };

/** One bill of a month, put together by the server (GET /expenses/month). */
export type MonthItem = {
  key: string;
  kind: MonthItemKind;
  /** "YYYY-MM". */
  month: string;
  supplier: {
    id: string;
    name: string;
    scope: SupplierScope;
    billing: SupplierBilling;
  } | null;
  vehicle: ExpenseVehicle | null;
  debt: {
    id: string;
    label: string;
    kind: string;
    installment: number;
    installments: number;
  } | null;
  description: string;
  /** Currency of the bill (a debt installment is always BRL). */
  currency: Currency;
  /** What the cost predicts, in reais (null when nothing does, or no rate yet). */
  expected: number | null;
  /** The prediction in `currency` (null when BRL). */
  expectedForeign: number | null;
  /** The rate behind `expected` (null when BRL). */
  conversion: Conversion | null;
  /** The record's, else the cost's (null = not told). */
  paymentMethod: ExpensePaymentMethod | null;
  paymentCard: PaymentCardRef | null;
  dueDate: string | null;
  status: MonthItemStatus;
  /** Recorded amount, or the cash paid for the installment (late fee included). */
  amount: number | null;
  /** Installment only: the late fee inside `amount` (null = none). */
  surcharge: number | null;
  /** Installment only: how much of it is paid off. */
  covered: number | null;
  paidAt: string | null;
  /** The record behind it (null = nothing recorded yet). */
  expense: {
    id: string;
    notes: string | null;
    /** The value in the bill's currency (null when BRL). */
    foreignAmount: number | null;
    /** Reais per unit that actually left (null when BRL). */
    exchangeRate: number | null;
    createdByName: string | null;
    updatedAt: string;
    documentCount: number;
  } | null;
};

export type MonthTotals = { expected: number; paid: number; open: number };

export type PendingMonth = { month: string; count: number; amount: number };

export type ExpenseMonth = {
  month: string;
  items: MonthItem[];
  totals: MonthTotals;
  /** Earlier months still open, newest first. */
  pendingBefore: PendingMonth[];
};

export type SupplierMonth = {
  month: string;
  items: MonthItem[];
  totals: MonthTotals;
};

/** A recorded expense (GET/POST/PUT /expenses). */
export type Expense = {
  id: string;
  supplier: { id: string; name: string } | null;
  vehicle: ExpenseVehicle | null;
  month: string;
  description: string | null;
  /** In reais (what left the cash). */
  amount: number;
  currency: Currency;
  foreignAmount: number | null;
  exchangeRate: number | null;
  paymentMethod: ExpensePaymentMethod | null;
  paymentCard: PaymentCardRef | null;
  status: ExpenseStatus;
  paidAt: string | null;
  notes: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  documents: DocumentFile[];
};

/** Body of POST/PUT /expenses. */
export type ExpenseInput = {
  supplierId?: string | null;
  vehicleId?: string | null;
  month: string;
  description?: string | null;
  /** In reais (what left the cash). */
  amount: number;
  status: ExpenseStatus;
  /** yyyy-mm-dd, only when PAID. */
  paidAt?: string | null;
  notes?: string | null;
  /** Fixed cost: ignored (the cost's). */
  currency?: Currency;
  /** The value in `currency` (required when it isn't BRL). */
  foreignAmount?: number | null;
  paymentMethod?: ExpensePaymentMethod | null;
  paymentCardId?: string | null;
};
