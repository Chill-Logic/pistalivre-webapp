import type { Conversion, Currency, ExpensePaymentMethod } from "@/types/currency";
import type { DocumentFile } from "@/types/document";
import type { PaymentCardRef } from "@/types/payment-card";

/** COMPANY = fixed cost of the operation; VEHICLE = per-vehicle base cost. */
export type SupplierScope = "COMPANY" | "VEHICLE";

/** One bill a month, or one per vehicle (only VEHICLE can be PER_VEHICLE). */
export type SupplierBilling = "SINGLE" | "PER_VEHICLE";

export type SupplierListItem = {
  id: string;
  name: string;
  scope: SupplierScope;
  /** Base monthly amount, in `currency` (for VEHICLE, each link may override it). */
  monthlyAmount: number;
  /** `monthlyAmount` in reais (null = no rate yet). */
  monthlyAmountBrl: number | null;
  currency: Currency;
  /** Today's rate + the card's surcharge (null when BRL). */
  conversion: Conversion | null;
  paymentMethod: ExpensePaymentMethod | null;
  paymentCard: PaymentCardRef | null;
  active: boolean;
  billing: SupplierBilling;
  /** Due day (1–31) when known. */
  dueDay: number | null;
  /** "YYYY-MM": first month it shows in the month's bills. */
  startsOn: string | null;
  /** "YYYY-MM": last month it applies (null = no end). */
  endsOn: string | null;
  vehicleCount: number;
  createdAt: string;
};

/** List row: + the real monthly weight (VEHICLE = sum of the links). */
export type SupplierListRow = SupplierListItem & {
  /** In `currency`. */
  currentMonthly: number;
  /** In reais (null = no rate yet). */
  currentMonthlyBrl: number | null;
};

export type SupplierVehicleLink = {
  linkId: string;
  vehicle: { id: string; plate: string; label: string };
  /** The amount PER vehicle (in the cost's currency) — the one the projection uses. */
  monthlyAmount: number;
  monthlyAmountBrl: number | null;
  active: boolean;
  billing: SupplierBilling;
  dueDay: number | null;
  startsOn: string | null;
  endsOn: string | null;
  currency: Currency;
  paymentMethod: ExpensePaymentMethod | null;
  /** Only by card. */
  paymentCardId: string | null;
};

export type SupplierDetail = SupplierListItem & {
  updatedAt: string;
  vehicles: SupplierVehicleLink[];
  vehiclesMonthlyTotal: number;
  vehiclesMonthlyTotalBrl: number | null;
  documents: DocumentFile[];
};

export type SupplierFilters = {
  page: number;
  pageSize: number;
  q: string;
  scope: SupplierScope | "";
  /** "" = all. */
  active: "" | "true" | "false";
};

/** Body of POST/PUT /suppliers. */
export type SupplierInput = {
  name: string;
  scope: SupplierScope;
  monthlyAmount: number;
  active: boolean;
  billing: SupplierBilling;
  dueDay: number | null;
  startsOn: string | null;
  endsOn: string | null;
};
