import type { SignatureStatus } from "@/types/signature";

/** The latest signature request of a PDF (staff reads only). */
export type DocumentSignature = {
  requestId: string;
  status: SignatureStatus;
};

export type DocumentFile = {
  id: string;
  /** `slug` finds a kind without its display name ("crlv"). */
  category: { id: string; name: string; slug?: string } | null;
  fileName: string;
  contentType: string;
  size: number;
  /** Relative to the API server root (`/api/files/<key>`), not to `/api`. */
  url: string;
  createdAt: string;
  /**
   * Staff reads only (absent in the portal): the latest signature request of
   * this PDF. Any request locks deleting it and replacing the file.
   */
  signature?: DocumentSignature | null;
};

/**
 * A file hung on something else (a charge's receipts): enough to view,
 * download, rename and delete it.
 */
export type DocumentAttachment = Pick<
  DocumentFile,
  "id" | "category" | "fileName" | "url" | "signature"
>;

/**
 * Enough of a file to open/download it. Some lists (a charge's attachments)
 * send only id, name, kind and url.
 */
export type FileLink = Pick<DocumentFile, "id" | "fileName" | "url"> &
  Partial<
    Pick<
      DocumentFile,
      "category" | "contentType" | "size" | "createdAt" | "signature"
    >
  >;

/** Who a document belongs to (polymorphic owner, as in the API). */
export type DocumentOwnerType =
  | "VEHICLE"
  | "CUSTOMER"
  | "RENTAL"
  | "INSPECTION"
  | "MAINTENANCE"
  | "SUPPLIER"
  | "COMPANY"
  | "LEAD"
  | "PROPOSAL"
  | "DEBT"
  | "DEBT_PAYMENT"
  | "CUSTOMER_DEBT"
  | "PAYMENT"
  | "CUSTOMER_DEBT"
  | "LEAD"
  | "LEAD_ACTIVITY"
  | "PROPOSAL"
  | "REIMBURSEMENT"
  | "EXPENSE"
  | "PARTNER_CONTRACT";

export type DocumentOwner = { type: DocumentOwnerType; id: string };

/** A document "kind" (espécie), scoped to an owner type. */
export type DocumentCategory = { id: string; name: string; slug: string };

export type DocumentUpdateInput = {
  filename?: string;
  categoryId?: string | null;
  /** Replaces the bytes (multipart). Refused (409) under signature. */
  file?: File;
};
