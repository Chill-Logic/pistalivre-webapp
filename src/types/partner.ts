import type { DocumentFile } from "@/types/document";
/** CPF = a person; CNPJ = a company (may be the new alphanumeric one). */
export type PartnerDocumentType = "CPF" | "CNPJ";

/** INVESTMENT = vehicles in the company's name; MANAGEMENT = in the partner's. */
export type PartnerContractType = "INVESTMENT" | "MANAGEMENT";

export type PartnerContractStatus = "DRAFT" | "ACTIVE" | "ENDED";

/** The investor's contribution: the vehicles themselves, or money. */
export type PartnerContributionType = "ASSETS" | "CASH";

/** What the partner's share is taken from. */
export type PartnerShareBase = "REVENUE" | "PROFIT";

/** Someone whose vehicles the company manages (gestão, the whole staff). */
export type Partner = {
  id: string;
  name: string;
  tradeName: string | null;
  documentType: PartnerDocumentType;
  /** Digits only (CNPJ may carry letters). */
  document: string;
  /** Also the login of the partner area. */
  email: string;
  phone: string | null;
  /** Where the payout goes — always paid outside the system. */
  pixKey: string | null;
  notes: string | null;
  active: boolean;
  hasAccess: boolean;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
};

/** List row: + contracts and vehicles currently in an active contract. */
export type PartnerListRow = Partner & {
  contractCount: number;
  vehicleCount: number;
};

/** A vehicle in a contract and the window in which it is the partner's. */
export type PartnerContractVehicle = {
  /** The link id (routes …/vehicles/:linkId). */
  id: string;
  vehicleId: string;
  plate: string | null;
  label: string | null;
  acquisitionValue: number | null;
  /** YYYY-MM-DD */
  joinedAt: string;
  leftAt: string | null;
};

export type PartnerContract = {
  id: string;
  code: string;
  partnerId: string;
  type: PartnerContractType;
  status: PartnerContractStatus;
  contributionType: PartnerContributionType | null;
  contributionAmount: number | null;
  contributionDate: string | null;
  shareBase: PartnerShareBase | null;
  sharePercent: number | null;
  adminFeePercent: number | null;
  adminFeeFixed: number | null;
  payoutDay: number | null;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string | null;
  notes: string | null;
  vehicles: PartnerContractVehicle[];
  createdAt: string;
};

export type PartnerDetail = Partner & { contracts: PartnerContract[] };

export type PartnerContractDetail = PartnerContract & { partner: Partner };

export type PartnerFilters = {
  page: number;
  pageSize: number;
  q: string;
  /** "" = all. */
  active: "" | "true" | "false";
};

/** Body of POST/PATCH /partners. */
export type PartnerInput = {
  name: string;
  tradeName: string | null;
  documentType: PartnerDocumentType;
  document: string;
  email: string;
  phone: string | null;
  pixKey: string | null;
  notes: string | null;
  active: boolean;
};

/**
 * Body of POST /partners/:id/contracts and PATCH /partner-contracts/:id. The
 * PATCH replaces the terms (status included, it defaults to DRAFT): always
 * send them all.
 */
export type PartnerContractInput = {
  type: PartnerContractType;
  status?: PartnerContractStatus;
  contributionType: PartnerContributionType | null;
  contributionAmount: number | null;
  contributionDate: string | null;
  shareBase: PartnerShareBase | null;
  sharePercent: number | null;
  adminFeePercent: number | null;
  adminFeeFixed: number | null;
  payoutDay: number | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
};

export type PartnerVehicleInput = {
  vehicleId: string;
  acquisitionValue: number | null;
  joinedAt: string;
};

export type PartnerVehicleUpdate = {
  acquisitionValue: number | null;
  joinedAt: string;
  leftAt: string | null;
};

/** The contract's PDF (GET/POST /partner-contracts/:id/document). */
export type PartnerContractDocument = {
  document: DocumentFile | null;
  generatedAt: string | null;
};

/** Base text merged with the contract's data, for the editor. */
export type PartnerContractDocumentDraft = {
  html: string;
  /** Whether the AI is configured (the chat also needs the person's tools). */
  aiEnabled: boolean;
};
