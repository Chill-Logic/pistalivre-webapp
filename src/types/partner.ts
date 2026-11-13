import type { DocumentFile } from "@/types/document";
import type { RatePeriod } from "@/types/rental";
/** CPF = a person; CNPJ = a company (may be the new alphanumeric one). */
export type PartnerDocumentType = "CPF" | "CNPJ";

/** INVESTMENT = vehicles in the company's name; MANAGEMENT = in the partner's. */
export type PartnerContractType = "INVESTMENT" | "MANAGEMENT";

export type PartnerContractStatus = "DRAFT" | "ACTIVE" | "ENDED";

/** The investor's contribution: the vehicles themselves, or money. */
export type PartnerContributionType = "ASSETS" | "CASH";

/** What the partner's share is taken from. */
export type PartnerShareBase = "REVENUE" | "PROFIT";

/** How often the partner is paid (always outside the system). */
export type PartnerPayoutFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

/** Who bears an expense of the vehicles. RENTER only for maintenance and fines. */
export type PartnerCostPayer = "COMPANY" | "PARTNER" | "RENTER";

export type PartnerCostKey =
  "maintenance" | "insurance" | "tracker" | "taxes" | "fines";

export type PartnerContractCosts = Record<PartnerCostKey, PartnerCostPayer>;

/** The offered rent's period (a partner vehicle is never offered per year). */
export type PartnerOfferRatePeriod = Exclude<RatePeriod, "YEARLY">;

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
  /** What the company intends to rent it for (null only on old links). */
  offerRate: number | null;
  offerRatePeriod: PartnerOfferRatePeriod | null;
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
  /**
   * Management: SHARE = the company keeps its fee and the owner gets the rest;
   * FIXED = the owner gets `fixedPayout` per vehicle per month, pro rata of the
   * days rented (a cap), minus their part of the month's real maintenance
   * (`maintenanceMode`: X% of the cost, or the cost + X%) and their costs.
   */
  payoutMode: PartnerPayoutMode;
  fixedPayout: number | null;
  maintenanceFeePercent: number | null;
  maintenanceMode?: PartnerMaintenanceMode | null;
  calculatorScenario?: PartnerCalculatorScenario | null;
  payoutFrequency: PartnerPayoutFrequency;
  /** Monthly payout: day of the month (1–31). */
  payoutDay: number | null;
  /** Weekly/biweekly payout: 0 = Sunday … 6 = Saturday. */
  payoutWeekday: number | null;
  costs: PartnerContractCosts;
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
export type PartnerPayoutMode = "SHARE" | "FIXED";
/**
 * Fixed payout: how the month's real maintenance reaches the owner —
 * COST_SHARE = X% of the cost (the company bears the rest); COST_PLUS_FEE =
 * the whole cost + X%.
 */
export type PartnerMaintenanceMode = "COST_SHARE" | "COST_PLUS_FEE";

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
  /**
   * Management: SHARE = the company keeps its fee and the owner gets the rest;
   * FIXED = the owner gets `fixedPayout` per vehicle per month, pro rata of the
   * days rented (a cap), minus their part of the month's real maintenance
   * (`maintenanceMode`) and their costs.
   */
  payoutMode: PartnerPayoutMode;
  fixedPayout: number | null;
  maintenanceFeePercent: number | null;
  maintenanceMode?: PartnerMaintenanceMode | null;
  payoutFrequency: PartnerPayoutFrequency;
  payoutDay: number | null;
  payoutWeekday: number | null;
  costs: PartnerContractCosts;
  startDate: string;
  endDate: string | null;
  notes: string | null;
};

export type PartnerVehicleInput = {
  vehicleId: string;
  acquisitionValue: number | null;
  offerRate: number;
  offerRatePeriod: PartnerOfferRatePeriod;
  joinedAt: string;
};

export type PartnerVehicleUpdate = {
  acquisitionValue: number | null;
  offerRate: number;
  offerRatePeriod: PartnerOfferRatePeriod;
  joinedAt: string;
  leftAt: string | null;
};

/** The contract's PDF (GET/POST /partner-contracts/:id/document). */
export type PartnerContractDocument = {
  document: DocumentFile | null;
  generatedAt: string | null;
};

/** Base text merged with the contract's data, for the editor. */
/**
 * The calculator's scenario saved on the contract ("Quanto o parceiro
 * recebe?"), shared by the screen and the assistant. A working note, not a term.
 */
export type PartnerCalculatorScenario = {
  count: number | null;
  rate: number | null;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | null;
  occupancy: number | null;
  /** Per vehicle per month (taxes: per year). */
  costs: Partial<
    Record<"maintenance" | "insurance" | "tracker" | "taxes" | "fines", number | null>
  >;
};

/** GET /partner-contracts/:id/text-draft: the contract's living text. */
export type PartnerContractTextDraft = {
  draft: import("@/types/contract").ContractDraftState;
  aiEnabled: boolean;
  /** Still a draft with nothing sent: the text and the terms can change. */
  workable: boolean;
  lockedReason: string | null;
};

export type PartnerContractDocumentDraft = {
  html: string;
  /** Whether the AI is configured (the chat also needs the person's tools). */
  aiEnabled: boolean;
};

/** A version of the contract sent to the partner (the terms frozen in it). */
export type PartnerProposalStatus =
  | "PROPOSED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"
  | "SUPERSEDED";

export type PartnerProposalVersion = {
  id: string;
  number: number;
  status: PartnerProposalStatus;
  createdAt: string;
  decidedAt: string | null;
  /** The partner's reason, on a refusal. */
  decisionNote: string | null;
  /** Where the partner accepted/refused from. */
  decidedIp: string | null;
  /** The signature request made from the accepted version. */
  signatureRequestId: string | null;
  /** The version's PDF. */
  document: DocumentFile | null;
};

/** GET /partner-contracts/:id/proposals (newest first). */
export type PartnerProposals = {
  items: PartnerProposalVersion[];
  acceptedVersionId: string | null;
  /** The accepted version says what the contract says (activation needs it). */
  acceptedMatchesTerms: boolean;
};
