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
  rentalId: string;
  templateId: string;
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
