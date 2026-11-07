import type { DocumentFile, DocumentOwnerType } from "@/types/document";

export type SignatureStatus =
  | "DRAFT"
  | "SENT"
  | "SIGNED"
  | "REFUSED"
  | "CANCELED";

export type SignerStatus = "PENDING" | "SIGNED" | "REFUSED";

export type SignatureListItem = {
  id: string;
  name: string;
  status: SignatureStatus;
  /** SYSTEM = we created the envelope; IMPORTED = linked from the provider. */
  source: "SYSTEM" | "IMPORTED";
  signerCount: number;
  signedCount: number;
  /** null = the PDF is gone. */
  document:
    | (DocumentFile & { ownerType: DocumentOwnerType; ownerId: string })
    | null;
  deadlineAt: string | null;
  sentAt: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Signer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  /** CPF, digits only. */
  documentation: string | null;
  /** 1 signs first; the same order signs in parallel. */
  order: number;
  role: string;
  notify: string;
  status: SignerStatus;
  signedAt: string | null;
  customerId: string | null;
  userId: string | null;
};

export type SignatureDetail = SignatureListItem & {
  message: string | null;
  /** Reminder every N days. */
  remindInterval: number;
  autoClose: boolean;
  provider: string | null;
  /** Only for DRAFT: what still prevents sending. */
  blockers: string[];
  signers: Signer[];
};

export type SignatureFilters = {
  page: number;
  pageSize: number;
  q: string;
  status: SignatureStatus | "";
};
