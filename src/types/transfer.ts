export type TransferSourceAccount = "INTER" | "ASAAS" | "C6";
export type TransferPurpose = "ADHOC" | "REIMBURSEMENT";
export type TransferStatus = "PROCESSING" | "DONE" | "FAILED";

/**
 * A pix the platform sent before money-out left the system. History only:
 * there is no route to emit one (the pix key itself never comes).
 */
export type Transfer = {
  id: string;
  sourceAccount: TransferSourceAccount;
  purpose: TransferPurpose;
  amount: number;
  pixKeyType: string;
  pixOwnerName: string | null;
  description: string;
  customer: { id: string; name: string | null } | null;
  reimbursementRequestId: string | null;
  endToEnd: string | null;
  status: TransferStatus;
  /** ISO date-time. */
  createdAt: string;
};
