import type { DocumentFile } from "@/types/document";

/** COMPANY = fixed cost of the operation; VEHICLE = per-vehicle base cost. */
export type SupplierScope = "COMPANY" | "VEHICLE";

export type SupplierListItem = {
  id: string;
  name: string;
  scope: SupplierScope;
  /** Base monthly amount (for VEHICLE, each link may override it). */
  monthlyAmount: number;
  active: boolean;
  vehicleCount: number;
  createdAt: string;
};

export type SupplierVehicleLink = {
  linkId: string;
  vehicle: { id: string; plate: string; label: string };
  /** The amount PER vehicle — the one the projection uses. */
  monthlyAmount: number;
  active: boolean;
};

export type SupplierDetail = SupplierListItem & {
  updatedAt: string;
  vehicles: SupplierVehicleLink[];
  vehiclesMonthlyTotal: number;
  documents: DocumentFile[];
};

export type SupplierFilters = {
  q: string;
  scope: SupplierScope | "";
  /** "" = all. */
  active: "" | "true" | "false";
};
