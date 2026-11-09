import type { DocumentFile } from "@/types/document";

/** COMPANY = fixed cost of the operation; VEHICLE = per-vehicle base cost. */
export type SupplierScope = "COMPANY" | "VEHICLE";

/** One bill a month, or one per vehicle (only VEHICLE can be PER_VEHICLE). */
export type SupplierBilling = "SINGLE" | "PER_VEHICLE";

export type SupplierListItem = {
  id: string;
  name: string;
  scope: SupplierScope;
  /** Base monthly amount (for VEHICLE, each link may override it). */
  monthlyAmount: number;
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
export type SupplierListRow = SupplierListItem & { currentMonthly: number };

export type SupplierVehicleLink = {
  linkId: string;
  vehicle: { id: string; plate: string; label: string };
  /** The amount PER vehicle — the one the projection uses. */
  monthlyAmount: number;
  active: boolean;
  billing: SupplierBilling;
  dueDay: number | null;
  startsOn: string | null;
  endsOn: string | null;
};

export type SupplierDetail = SupplierListItem & {
  updatedAt: string;
  vehicles: SupplierVehicleLink[];
  vehiclesMonthlyTotal: number;
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
