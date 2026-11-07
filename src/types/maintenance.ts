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
};

export type MaintenanceFilters = {
  page: number;
  pageSize: number;
  q: string;
  type: MaintenanceType | "";
};
