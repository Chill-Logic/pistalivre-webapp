import type {
  PartnerContractCosts,
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
