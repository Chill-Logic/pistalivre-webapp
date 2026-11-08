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
};

/**
 * A file hung on something else (a charge's receipts): enough to view,
 * download, rename and delete it.
 */
export type DocumentAttachment = Pick<
  DocumentFile,
  "id" | "category" | "fileName" | "url"
>;

/** Who a document belongs to (polymorphic owner, as in the API). */
export type DocumentOwnerType =
  | "VEHICLE"
  | "CUSTOMER"
  | "RENTAL"
  | "MAINTENANCE"
  | "SUPPLIER"
  | "COMPANY"
  | "DEBT"
  | "DEBT_PAYMENT"
  | "PAYMENT"
  | "CUSTOMER_DEBT"
  | "LEAD_ACTIVITY"
  | "REIMBURSEMENT";

export type DocumentOwner = { type: DocumentOwnerType; id: string };

/** A document "kind" (espécie), scoped to an owner type. */
export type DocumentCategory = { id: string; name: string; slug: string };

export type DocumentUpdateInput = {
  filename?: string;
  categoryId?: string | null;
};
