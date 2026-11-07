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

export type Debts = { summary: DebtsSummary; items: DebtListItem[] };
