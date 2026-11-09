import type { InspectionType } from "@/types/inspection";
import type { MaintenanceType } from "@/types/maintenance";
import type { RatePeriod, RentalStatus } from "@/types/rental";
import type { VehicleStatus } from "@/types/vehicle";
import type {
  PartnerContractCosts,
  PartnerOfferRatePeriod,
  PartnerPayoutFrequency,
  PartnerProposalStatus,
} from "@/types/partner";

/**
 * The partner area (app.parceiro): read only, resolved on the server for the
 * partner behind the Bearer. Calendar dates come as YYYY-MM-DD; money is
 * already computed by the API (never redo the math here).
 */

export type PartnerDocumentType = "CPF" | "CNPJ";
export type PartnerContractType = "INVESTMENT" | "MANAGEMENT";
export type PartnerContractStatus = "DRAFT" | "ACTIVE" | "ENDED";
export type PartnerContributionType = "ASSETS" | "CASH";
export type PartnerShareBase = "REVENUE" | "PROFIT";

export type PartnerAreaProfile = {
  name: string;
  tradeName: string | null;
  documentType: PartnerDocumentType;
  /** The login. */
  email: string;
  /** Digits only. */
  phone: string | null;
  pixKey: string | null;
};

export type PartnerAreaCurrentRental = {
  id: string;
  code: string;
  /** Only the renter's name: nothing else of the customer reaches the partner. */
  customerName: string;
  visibleFrom: string;
};

export type PartnerAreaContractVehicle = {
  vehicleId: string;
  plate: string | null;
  label: string | null;
  /** Today's state; null once the vehicle left the contract. */
  status: VehicleStatus | null;
  acquisitionValue: number | null;
  /** What the company intends to rent it for (null only on old links). */
  offerRate: number | null;
  offerRatePeriod: PartnerOfferRatePeriod | null;
  joinedAt: string;
  leftAt: string | null;
  currentRental: PartnerAreaCurrentRental | null;
};

export type PartnerAreaContract = {
  id: string;
  code: string;
  type: PartnerContractType;
  status: PartnerContractStatus;
  contributionType: PartnerContributionType | null;
  contributionAmount: number | null;
  contributionDate: string | null;
  shareBase: PartnerShareBase | null;
  sharePercent: number | null;
  adminFeePercent: number | null;
  adminFeeFixed: number | null;
  payoutFrequency: PartnerPayoutFrequency;
  payoutDay: number | null;
  payoutWeekday: number | null;
  costs: PartnerContractCosts;
  startDate: string;
  endDate: string | null;
  /** The contract's PDF is available (GET /partner/contracts/:id/document). */
  hasDocument: boolean;
  vehicles: PartnerAreaContractVehicle[];
};

/** What a contract says (terms only): shared by contracts and proposals. */
export type PartnerAreaTerms = Pick<
  PartnerAreaContract,
  | "type"
  | "contributionType"
  | "contributionAmount"
  | "contributionDate"
  | "shareBase"
  | "sharePercent"
  | "adminFeePercent"
  | "adminFeeFixed"
  | "payoutFrequency"
  | "payoutDay"
  | "payoutWeekday"
>;

/** A vehicle offered in a proposal, with the rent the company intends. */
export type PartnerAreaProposalVehicle = {
  vehicleId: string;
  plate: string | null;
  label: string | null;
  acquisitionValue: number | null;
  offerRate: number | null;
  offerRatePeriod: PartnerOfferRatePeriod | null;
  joinedAt: string;
};

/** The version the partner decides on (the latest not withdrawn). */
export type PartnerAreaProposalVersion = {
  id: string;
  number: number;
  status: PartnerProposalStatus;
  createdAt: string;
  decidedAt: string | null;
  /** Their reason, when they refused. */
  decisionNote: string | null;
};

/** A draft contract sent to the partner, with the terms it proposes. */
export type PartnerAreaProposal = PartnerAreaTerms & {
  contractId: string;
  code: string;
  costs: PartnerContractCosts;
  startDate: string;
  endDate: string | null;
  vehicles: PartnerAreaProposalVehicle[];
  version: PartnerAreaProposalVersion;
};

/** GET /partner */
export type PartnerAreaHome = {
  partner: PartnerAreaProfile;
  contracts: PartnerAreaContract[];
  /** Draft contracts with a version sent (absent on an older API). */
  proposals?: PartnerAreaProposal[];
};

/** A rental of a partner's vehicle, cut to what the partner may see. */
export type PartnerAreaRental = {
  id: string;
  code: string;
  status: RentalStatus;
  vehicleId: string;
  customerName: string;
  startDate: string | null;
  endDate: string | null;
  visibleFrom: string;
  /** null = still visible today. */
  visibleTo: string | null;
  rate: number;
  ratePeriod: RatePeriod;
};

export type PartnerAreaMaintenance = {
  id: string;
  performedAt: string;
  type: MaintenanceType;
  /** Service codes (MAINTENANCE_SERVICE_LABELS). */
  services: string[];
  mileage: number | null;
  cost: number | null;
  provider: string | null;
};

export type PartnerAreaInspection = {
  id: string;
  /** Timestamp (format in Brasília time). */
  createdAt: string;
  type: InspectionType;
  mileage: number | null;
};

/** GET /partner/vehicles/:id */
export type PartnerAreaVehicleDetail = {
  vehicle: {
    id: string;
    plate: string;
    label: string;
    year: number;
    color: string | null;
    /** null once the vehicle left the contract. */
    status: VehicleStatus | null;
  };
  /** When the vehicle was the partner's (to = null: still is). */
  windows: { from: string; to: string | null }[];
  rentals: PartnerAreaRental[];
  maintenances: PartnerAreaMaintenance[];
  inspections: PartnerAreaInspection[];
};

/** NONE = no cycle covers today (a day off, or the rental ended). */
export type PartnerAreaTodayState =
  "PAID" | "PARTIAL" | "OPEN" | "UPCOMING" | "WAIVED" | "NONE";

export type PartnerAreaCycleState =
  "PAID" | "PARTIAL" | "OPEN" | "UPCOMING" | "WAIVED";

export type PartnerAreaCycle = {
  start: string;
  end: string;
  due: string;
  period: RatePeriod;
  state: PartnerAreaCycleState;
  amount: number;
  paid: number;
  missing: number;
  paidLate: boolean;
};

export type PartnerAreaSituation = {
  todayCycle: {
    state: PartnerAreaTodayState;
    start: string | null;
    end: string | null;
    due: string | null;
    period: RatePeriod | null;
    amount: number;
    paid: number;
    missing: number;
  };
  lastPayment: { at: string; amount: number } | null;
  /** Days since the oldest unpaid due date before today (0 = on time). */
  daysLate: number;
  lateSince: string | null;
  lateCycles: number;
  overdueAmount: number;
  balance: number;
  credit: number;
  nextDue: string | null;
};

/** `credit` = a discount granted by the company, not money in. */
export type PartnerAreaPaymentKind = "payment" | "credit";

export type PartnerAreaStatement = {
  situation: PartnerAreaSituation;
  totalPaid: number;
  paidThrough: string | null;
  /** Newest first. */
  cycles: PartnerAreaCycle[];
  /** Newest first. */
  payments: { paidAt: string; amount: number; kind: PartnerAreaPaymentKind }[];
};

/** GET /partner/rentals/:id */
export type PartnerAreaRentalDetail = {
  rental: PartnerAreaRental & {
    plate: string | null;
    vehicleLabel: string | null;
  };
  /** null = no rent charge yet. */
  statement: PartnerAreaStatement | null;
};

export type PartnerAreaProfileInput = {
  phone?: string | null;
  pixKey?: string | null;
};

export type PartnerAreaPasswordInput = {
  currentPassword: string;
  newPassword: string;
};

/** A rental of the partner (Locações page), with its vehicle. */
export type PartnerAreaRentalRow = PartnerAreaRental & {
  vehicleLabel: string;
  plate: string;
};

/** A vehicle of the partner (Veículos page), with its contract. */
export type PartnerAreaVehicleRow = PartnerAreaContractVehicle & {
  contractId: string;
  contractCode: string;
};
