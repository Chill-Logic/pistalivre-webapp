import type { Paginated } from "@/types/api";
import type { DocumentFile } from "@/types/document";

export type DebtLender = {
  id: string;
  type: "CUSTOMER" | "SUPPLIER" | "USER" | "OTHER";
  /** Snapshot: survives the registration being deleted. */
  name: string;
  customerId: string | null;
  supplierId: string | null;
  userId: string | null;
};

/** The management badge, ready-made by the API — never derive it here. */
export type DebtStatus = {
  label: string;
  variant: "success" | "destructive" | "warning" | "neutral";
};

export type DebtBalance = {
  principal: number;
  interest: number;
  total: number;
  /** Amortized (what reduced the debt). */
  paid: number;
  /** What actually left the cash (can differ by fines/discounts). */
  disbursed: number;
  surcharge: number;
  discount: number;
  outstanding: number;
  settled: boolean;
  lastPaymentAt: string | null;
  elapsedPeriods: number | null;
  /** Timestamp: interest computed up to this moment. */
  accruedUntil: string | null;
};

export type DebtListItem = {
  id: string;
  lenders: DebtLender[];
  lendersLabel: string;
  kind: "LOAN" | "FINANCING" | "OTHER";
  vehicleId: string | null;
  countsAsCost: boolean;
  principal: number;
  /** null = no interest (the period/mode/base then hold their defaults). */
  interestPercent: number | null;
  interestPeriod: "TOTAL" | "MONTHLY" | "YEARLY";
  interestMode: "SIMPLE" | "COMPOUND";
  interestBase: "PRINCIPAL" | "OUTSTANDING";
  /** Calendar dates (midnight UTC). */
  borrowedAt: string;
  dueDate: string | null;
  installments: number;
  nextDueDate: string | null;
  overdue: boolean;
  status: DebtStatus;
  monthlyCost: number;
  remainingInstallments: number;
  balance: DebtBalance;
  createdAt: string;
};

export type DebtsSummary = {
  borrowed: number;
  interest: number;
  total: number;
  paid: number;
  outstanding: number;
  count: number;
  openCount: number;
  overdueCount: number;
  overdueAmount: number;
};

export type DebtInstallment = {
  number: number;
  dueDate: string;
  amount: number;
  paid: number;
  status: "PAID" | "PARTIAL" | "OVERDUE" | "OPEN";
};

export type DebtPayment = {
  id: string;
  amount: number;
  surcharge: number;
  discount: number;
  barcode: string | null;
  /** Calendar date. */
  paidAt: string;
  notes: string | null;
  createdAt: string;
  documents: DocumentFile[];
};

export type DebtDetail = DebtListItem & {
  notes: string | null;
  createdByName: string | null;
  vehicle: { id: string; plate: string; label: string } | null;
  plan: DebtInstallment[];
  payments: DebtPayment[];
  documents: DocumentFile[];
};

/** A page of debts; the summary always covers ALL of them. */
export type Debts = Paginated<DebtListItem> & { summary: DebtsSummary };

export type DebtFilters = { page: number; pageSize: number };

/** Body of POST /debts/:id/payments (dates yyyy-mm-dd). */
export type DebtPaymentInput = {
  amount: number;
  paidAt: string;
  surcharge?: number;
  discount?: number;
  barcode?: string;
  notes?: string;
};

/** A lender as sent: one of our records (by id) or a free name. */
export type DebtLenderInput = {
  type: DebtLender["type"];
  customerId?: string;
  supplierId?: string;
  userId?: string;
  name?: string;
};

/** Body of POST/PUT /debts (PUT replaces the whole debt). */
export type DebtInput = {
  lenders: DebtLenderInput[];
  kind: DebtListItem["kind"];
  vehicleId: string | null;
  countsAsCost: boolean;
  principal: number;
  interestPercent: number | null;
  interestPeriod: DebtListItem["interestPeriod"];
  interestMode: DebtListItem["interestMode"];
  interestBase: DebtListItem["interestBase"];
  borrowedAt: string;
  dueDate: string | null;
  installments: number;
  notes: string | null;
};
