import type { DocumentFile } from "@/types/document";
import type { ReimbursementStatus } from "@/types/portal";

/** A refund request as the staff reviews it (read-only here). */
export type StaffReimbursement = {
  id: string;
  status: ReimbursementStatus;
  amount: number;
  reason: string;
  /** What the staff told the customer (rejection reason, notes). */
  staffNote: string | null;
  customer: { id: string; name: string };
  rental: { id: string; code: string } | null;
  destination: {
    pixKey: string;
    pixKeyType: string;
    ownerName: string | null;
    /** Came from a wallet key validated in the DICT. */
    validated: boolean;
  };
  maintenance: {
    id: string;
    type: string;
    /** Calendar date. */
    performedAt: string;
    cost: number | null;
    description: string | null;
    documents: DocumentFile[];
  } | null;
  documents: DocumentFile[];
  transferId: string | null;
  /** Paid OUTSIDE the system (calendar date), when recorded. */
  paidAt: string | null;
  paidAmount: number | null;
  paidNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

/** One item of the "what was missing" checklist of a rejection. */
export type ReimbursementMissingItem = { code: string; label: string };

export type StaffReimbursements = {
  pending: StaffReimbursement[];
  history: StaffReimbursement[];
  missingItems: ReimbursementMissingItem[];
};

export type RejectReimbursementInput = {
  missing: string[];
  note: string | null;
};

/** Body of POST /reimbursements/:id/paid (`paidAt` = yyyy-mm-dd). */
export type MarkReimbursementPaidInput = {
  paidAt: string;
  paidAmount: number;
  note: string | null;
};
