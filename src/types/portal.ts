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
  inspections: PortalInspection[];
  maintenances: PortalMaintenance[];
  reimbursements: Reimbursement[];
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
