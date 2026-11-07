export type DocumentFile = {
  id: string;
  category: { id: string; name: string } | null;
  fileName: string;
  contentType: string;
  size: number;
  /** Relative to the API server root (`/api/files/<key>`), not to `/api`. */
  url: string;
  createdAt: string;
};

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
  | "LEAD_ACTIVITY";

export type DocumentOwner = { type: DocumentOwnerType; id: string };

/** A document "kind" (espécie), scoped to an owner type. */
export type DocumentCategory = { id: string; name: string; slug: string };

export type DocumentUpdateInput = {
  filename?: string;
  categoryId?: string | null;
};
