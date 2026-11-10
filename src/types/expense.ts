import type { DocumentFile } from "@/types/document";
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
  /** What the cost predicts (null when nothing does). */
  expected: number | null;
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
  amount: number;
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
  amount: number;
  status: ExpenseStatus;
  /** yyyy-mm-dd, only when PAID. */
  paidAt?: string | null;
  notes?: string | null;
};
