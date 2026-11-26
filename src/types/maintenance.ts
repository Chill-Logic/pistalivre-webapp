import type { DocumentFile } from "@/types/document";

export type MaintenanceType =
  "PREVENTIVE" | "CORRECTIVE" | "REVISION" | "OTHER";

export type MaintenanceVehicle = { id: string; plate: string; label: string };

export type MaintenanceListItem = {
  id: string;
  type: MaintenanceType;
  /** Calendar date (midnight UTC): format with formatCalendarDate. */
  performedAt: string;
  /** Service codes (MAINTENANCE_SERVICE_LABELS). */
  services: string[];
  /** Spec per service code, e.g. `{ FLUIDS: "Óleo 20w50" }`. */
  serviceDetails: Record<string, string> | null;
  cost: number | null;
  mileage: number | null;
  provider: string | null;
  /** CUSTOMER = the renter registered (and paid) it in the portal. */
  registeredBy: "STAFF" | "CUSTOMER";
  vehicle: MaintenanceVehicle;
  rental: { id: string; code: string } | null;
};

export type MaintenanceDetail = Omit<MaintenanceListItem, "rental"> & {
  description: string | null;
  performedByUserId: string | null;
  performedByCustomerId: string | null;
  /** Staff member or renter; null if nobody was recorded or was deleted. */
  performedByName: string | null;
  createdAt: string;
  rental: {
    id: string;
    code: string;
    customer: { id: string; name: string };
  } | null;
  documents: DocumentFile[];
  /** The vehicle's rentals: what the edit may link this maintenance to. */
  rentalOptions?: MaintenanceRentalOption[];
  /** Debts launched to a customer from this maintenance (cost passed on). */
  customerDebts?: {
    id: string;
    origin: string;
    amount: number;
    incurredAt: string;
    customer: { id: string; name: string };
  }[];
};

export type MaintenanceRentalOption = {
  id: string;
  code: string;
  status: string;
  startDate: string;
  endDate: string | null;
  customer: { id: string; name: string };
};

export type MaintenanceFilters = {
  page: number;
  pageSize: number;
  q: string;
  type: MaintenanceType | "";
  /** Scope to one vehicle or rental (detail-page sections). */
  vehicleId?: string;
  rentalId?: string;
};

/** Body of POST/PUT /maintenances (PUT ignores the vehicle; rentalId: same vehicle, null = none). */
export type MaintenanceInput = {
  vehicleId?: string;
  rentalId?: string | null;
  type: MaintenanceType;
  /** yyyy-mm-dd; retroactive is fine. */
  performedAt: string;
  services: string[];
  serviceDetails: Record<string, string>;
  mileage: number | null;
  cost: number | null;
  provider: string | null;
  description: string | null;
};
