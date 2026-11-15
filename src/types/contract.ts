import type { DocumentFile } from "@/types/document";

export type ContractStatus = "DRAFT" | "SENT" | "SIGNED" | "VOID";

/** A generated contract (the frozen HTML stays on the server). */
export type Contract = {
  id: string;
  rentalId: string;
  status: ContractStatus;
  templateId: string;
  templateVersion: number;
  signedAt: string | null;
  createdAt: string;
  /** The PDF attached to the rental under "Contrato". */
  document: DocumentFile | null;
  /** Who generated it and who confirmed "revisei os termos" (names). */
  generatedBy: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  /** The automatic review's warnings when it was confirmed (empty = none). */
  reviewWarnings: string[];
};

/** The review before generating or sending: what was agreed and where the text differs. */
export type ContractReview = {
  summary: { label: string; value: string }[];
  issues: { code: string; message: string }[];
  /** Only on the send review: how the lessee is told by default. */
  signer?: { channel: "WHATSAPP" | "EMAIL"; phone: string | null; email: string | null };
};

/** The customer's CNH as the contract flow sees it (`ok` = valid today). */
export type LicenseStatus = {
  ok: boolean;
  number: string | null;
  issuedAt: string | null;
  validUntil: string | null;
};

/** PUT /customers/:id/cnh; dates are yyyy-mm-dd. */
export type LicenseInput = {
  driverLicense: string;
  issuedAt: string;
  validUntil: string;
};

/** The template merged with the rental, for the editor. Nothing saved. */
/** Who made a draft's last change. */
export type ContractDraftVia = "editor" | "chat" | "mcp" | "template";

/**
 * The contract text under review, saved on the server: the editor, the chat
 * and MCP clients edit the same text. `version` goes up on each save.
 */
export type ContractDraftState = {
  id: string;
  /** Owner: a rental's contract (rentalId + templateId) or a partner contract. */
  rentalId: string | null;
  templateId: string | null;
  partnerContractId?: string | null;
  html: string;
  version: number;
  updatedVia: ContractDraftVia;
  updatedAt: string;
  canUndo: boolean;
};

export type ContractDraft = ContractDraftState & {
  cnh: LicenseStatus;
  aiEnabled: boolean;
};

export type ContractOptions = { aiEnabled: boolean };
