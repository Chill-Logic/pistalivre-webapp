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
  /** Vehicle of the request's rental (null = no rental). */
  vehicle: { id: string; plate: string } | null;
  /** The maintenance this refund pays (linked at approval or by the portal). */
  maintenance: {
    id: string;
    type: string;
    /** Calendar date. */
    performedAt: string;
    cost: number | null;
    description: string | null;
    services: string[];
    provider: string | null;
    mileage: number | null;
    documents: DocumentFile[];
  } | null;
  /** Approved as "not a maintenance": why (null otherwise). */
  notMaintenanceReason: string | null;
  approvedAt: string | null;
  approvedByName: string | null;
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
  /** Approved, waiting for the pix sent by hand (no transfer in flight). */
  toPay: StaffReimbursement[];
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

/** A maintenance of the request's vehicle that this refund may pay. */
export type ReimbursementMaintenanceCandidate = {
  id: string;
  /** Calendar date. */
  performedAt: string;
  type: string;
  services: string[];
  cost: number | null;
  provider: string | null;
  description: string | null;
  mileage: number | null;
  rentalCode: string | null;
  /** exact = same value and close date; close = likely; null = just nearby. */
  match: "exact" | "close" | null;
};

export type ReimbursementMaintenanceCandidates = {
  vehicle: { id: string; plate: string } | null;
  candidates: ReimbursementMaintenanceCandidate[];
};

/** The new maintenance created from the request (its receipts go along). */
export type ReimbursementNewMaintenance = {
  /** Only when the request has no rental (the vehicle comes from it). */
  vehicleId?: string;
  type: string;
  /** yyyy-mm-dd */
  performedAt: string;
  services: string[];
  serviceDetails?: Record<string, string>;
  mileage?: number | null;
  cost?: number | null;
  provider?: string | null;
  description?: string | null;
};

/** Approving always says which maintenance it pays (or that it is none). */
export type ReimbursementApprovalLink =
  | { mode: "EXISTING"; maintenanceId: string }
  | { mode: "NEW"; maintenance: ReimbursementNewMaintenance }
  | { mode: "NONE"; reason: string };

export type ApproveReimbursementResult = {
  id: string;
  status: "APPROVED";
  maintenanceId: string | null;
  notMaintenanceReason: string | null;
  approvedAt: string;
};
