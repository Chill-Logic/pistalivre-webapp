import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type {
  PartnerContractCosts,
  PartnerProposalStatus,
  PartnerCostKey,
  PartnerCostPayer,
  PartnerOfferRatePeriod,
} from "@/types/partner";

/** Address of the partner area (login = the partner's e-mail). */
export const PARTNER_AREA_URL =
  "https://app.parceiro.pistalivrelocacoes.com.br";

/** The expenses of a contract, in the order they are shown. */
export const PARTNER_COST_KEYS: PartnerCostKey[] = [
  "maintenance",
  "insurance",
  "tracker",
  "taxes",
  "fines",
];

/** Who may bear each expense: the renter only on maintenance and fines. */
export const PARTNER_COST_PAYERS: Record<PartnerCostKey, PartnerCostPayer[]> = {
  maintenance: ["COMPANY", "PARTNER", "RENTER"],
  insurance: ["COMPANY", "PARTNER"],
  tracker: ["COMPANY", "PARTNER"],
  taxes: ["COMPANY", "PARTNER"],
  fines: ["COMPANY", "PARTNER", "RENTER"],
};

/** The API's default: all on the company, fines on the renter. */
export const PARTNER_DEFAULT_COSTS: PartnerContractCosts = {
  maintenance: "COMPANY",
  insurance: "COMPANY",
  tracker: "COMPANY",
  taxes: "COMPANY",
  fines: "RENTER",
};

/**
 * The accountant's model (investment, share of the revenue): the investor
 * pays the maintenance; insurance, tracker and IPVA are the company's; fines
 * go to the renter. The default of a new investment contract.
 */
export const PARTNER_REVENUE_DEFAULT_COSTS: PartnerContractCosts = {
  maintenance: "PARTNER",
  insurance: "COMPANY",
  tracker: "COMPANY",
  taxes: "COMPANY",
  fines: "RENTER",
};

/** The rule of the expenses, under the block, by the share's base. */
export const PARTNER_COST_RULE_HINT = {
  REVENUE: "O que for do parceiro sai inteiro da parte dele.",
  PROFIT: "No lucro, as despesas saem antes da divisão: ninguém arca sozinho.",
} as const;

/** A proposal version's situation (gestão). */
export const PARTNER_PROPOSAL_STATUS_LABELS: Record<
  PartnerProposalStatus,
  string
> = {
  PROPOSED: "Enviada",
  ACCEPTED: "Aceita",
  REJECTED: "Recusada",
  WITHDRAWN: "Retirada",
  SUPERSEDED: "Substituída",
};

/** The same, as the partner reads it (a pending one waits for them). */
export const PARTNER_AREA_PROPOSAL_STATUS_LABELS: Record<
  PartnerProposalStatus,
  string
> = {
  ...PARTNER_PROPOSAL_STATUS_LABELS,
  PROPOSED: "Aguardando você",
};

export const PARTNER_PROPOSAL_STATUS_VARIANT: Record<
  PartnerProposalStatus,
  BadgeVariantProps["variant"]
> = {
  PROPOSED: "warning",
  ACCEPTED: "success",
  REJECTED: "error",
  WITHDRAWN: "outline",
  SUPERSEDED: "outline",
};

/** Periods of the offered rent (RATE_PERIOD_LABELS without "Anual"). */
export const PARTNER_OFFER_RATE_PERIODS: PartnerOfferRatePeriod[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
];

/** "às sextas" / "aos domingos", by weekday (0 = Sunday). */
export const WEEKDAY_PLURAL = [
  "aos domingos",
  "às segundas",
  "às terças",
  "às quartas",
  "às quintas",
  "às sextas",
  "aos sábados",
];
