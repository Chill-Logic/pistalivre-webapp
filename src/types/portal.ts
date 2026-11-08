import type { UseMutationResult } from "@tanstack/react-query";
import type { DocumentFile } from "@/types/document";
import type { MaintenanceType } from "@/types/maintenance";
import type { InspectionActor, InspectionType } from "@/types/inspection";
import type {
  Caution,
  ChargeAmounts,
  RentalListItem,
  RentalStatus,
} from "@/types/rental";

/** The renter's view of a rental: no internal source/notes/billing. */
export type PortalRental = RentalListItem & {
  paymentMethod: string | null;
  paymentWeekday: number | null;
  caution: Caution | null;
  /** "Segunda-feira", "Todo dia 5", "Todos os dias, exceto domingo". */
  billingDayLabel: string | null;
  /** Rescinded: only the day (the reasons are never shown to the renter). */
  termination?: { date: string } | null;
};

/** GET /me/profile: the renter's own record (read-only). */
export type PortalProfile = {
  name: string;
  email: string | null;
  /** CPF. */
  document: string | null;
  phone: string | null;
};

export type PixQrCode = {
  /** Base64 PNG, without the data: prefix. */
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

/** A charge as the portal shows it (Asaas and manual merged, read-only). */
export type PortalCharge = {
  id: string;
  title: string | null;
  methodLabel: string;
  dueDate: string | null;
  status: string;
  open: boolean;
  amounts: ChargeAmounts;
  paidAt: string | null;
  /** "Fora do Asaas · LOC-…" or the rental code. */
  meta: string | null;
  invoiceUrl: string | null;
  pix: PixQrCode | null;
  attachments: Pick<DocumentFile, "id" | "category" | "fileName" | "url">[];
};

/** Authorized invoices only (pending or cancelled never reach the renter). */
export type PortalInvoice = {
  id: string;
  number: string | null;
  value: number;
  serviceDescription: string | null;
  effectiveDate: string | null;
  /** Public PDF on the gateway. */
  pdfUrl: string | null;
  rentalCode?: string | null;
};

export type WalletKey = {
  id: string;
  label: string | null;
  isDefault: boolean;
  pixKey: string;
  pixKeyType: string;
  ownerName: string | null;
  ownerDocument: string | null;
  bank: string | null;
  validatedAt: string | null;
};

export type ReimbursementStatus =
  "PENDING" | "APPROVED" | "PAID" | "FAILED" | "REJECTED";

export type Reimbursement = {
  id: string;
  amount: number;
  reason: string;
  status: ReimbursementStatus;
  staffNote: string | null;
  pixOwnerName: string | null;
  maintenanceId: string | null;
  rental?: { id: string; code: string | null } | null;
  createdAt: string;
  reviewedAt: string | null;
  documents: DocumentFile[];
};

export type PortalMaintenance = {
  id: string;
  type: MaintenanceType;
  performedAt: string;
  services: string[];
  cost: number | null;
  provider: string | null;
  description: string | null;
  /** Registered by this renter. */
  mine: boolean;
  documents: DocumentFile[];
  reimbursement: {
    id: string;
    status: ReimbursementStatus;
    staffNote: string | null;
  } | null;
};

export type PortalInspection = {
  id: string;
  type: InspectionType;
  performedBy: InspectionActor;
  mine: boolean;
  mileage: number | null;
  createdAt: string;
  photos: DocumentFile[];
};

/**
 * The whole rental page in one call, progressive disclosure done by the API:
 * invoices from "awaiting caution" on, the operational sections from
 * "active" on (empty arrays before), CRLV only while active.
 */
export type PortalRentalSections = {
  status: RentalStatus;
  closed: boolean;
  financialVisible: boolean;
  operationalVisible: boolean;
  contracts: DocumentFile[];
  crlv: DocumentFile[];
  charges: PortalCharge[];
  invoices: PortalInvoice[];
  documents: DocumentFile[];
  /** The renter's own documents ("Meus documentos"), always sent. */
  personalDocuments: DocumentFile[];
  inspections: PortalInspection[];
  maintenances: PortalMaintenance[];
  reimbursements: Reimbursement[];
};

/** GET /rentals/:id/customer-view: exactly what the renter sees (staff). */
export type RentalCustomerView = {
  rental: PortalRental;
  sections: PortalRentalSections;
};

/** Who a pix key belongs to, from the DICT, before saving it. */
export type PixKeyPreview = {
  ownerName: string;
  bank: string | null;
  /** Masked by the API. */
  ownerDocument: string | null;
};

export type WalletKeyInput = {
  pixKeyType: string;
  pixKey: string;
  label?: string;
};

/**
 * The wallet writes, the same for the renter (portal) and for the team (a
 * customer's record): the wallet dialogs take them, so both share the UI.
 */
export type WalletMutations = {
  preview: UseMutationResult<
    PixKeyPreview,
    Error,
    Pick<WalletKeyInput, "pixKeyType" | "pixKey">
  >;
  add: UseMutationResult<unknown, Error, WalletKeyInput>;
  setDefault: UseMutationResult<void, Error, string>;
  remove: UseMutationResult<void, Error, string>;
};

/**
 * POST /me/reimbursements. The pix destination is a key of the wallet
 * (never typed here); with a maintenance the amount is locked to its cost.
 */
export type ReimbursementRequestInput = {
  rentalId: string;
  walletMethodId: string;
  reason: string;
  amount?: number;
  maintenanceId?: string;
};

/** What the renter can attach files to (GET /me/document-categories). */
export type PortalAttachOwner = "MAINTENANCE" | "REIMBURSEMENT";

/** POST /me/rentals/:id/maintenances (multipart; a receipt is required). */
export type MaintenanceReportInput = {
  description: string;
  cost: number;
  /** yyyy-mm-dd; the API defaults to today. */
  performedAt?: string;
  files: File[];
};

/** One photo or check the inspection asks for (by vehicle type). */
export type InspectionRequirementItem = {
  key: string;
  label: string;
  required: boolean;
};

/** GET /me/rentals/:id/inspections/requirements (mileage is built in). */
export type InspectionRequirements = {
  photos: InspectionRequirementItem[];
  checks: InspectionRequirementItem[];
};

/** POST /me/rentals/:id/inspections; a KM reading takes no photos/checks. */
export type InspectionSubmitInput = {
  type: "FULL" | "KM";
  mileage: number;
  notes?: string;
  /** By requirement key. */
  photos: Record<string, File>;
  /** Keys of the checks found OK (absent = not OK). */
  checksOk: string[];
};
