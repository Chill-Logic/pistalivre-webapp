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
export type ContractDraft = {
  html: string;
  cnh: LicenseStatus;
  aiEnabled: boolean;
};

export type ContractOptions = { aiEnabled: boolean };
