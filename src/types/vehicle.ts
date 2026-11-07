import type { DocumentFile } from "@/types/document";

export type VehicleStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";

type Ref = { id: string; name: string };
type SluggedRef = Ref & { slug: string };

export type VehicleType = SluggedRef;

export type ActiveRental = {
  id: string;
  code: string;
  customer: Ref;
};

export type Vehicle = {
  id: string;
  plate: string;
  type: VehicleType;
  brand: Ref;
  model: Ref;
  year: number;
  category: SluggedRef;
  color: string | null;
  chassis: string;
  renavam: string;
  status: VehicleStatus;
  /** Latest reading across inspections and maintenances. */
  currentMileage: number | null;
  activeRental: ActiveRental | null;
  createdAt: string;
  updatedAt: string;
};

export type VehicleDetail = Vehicle & {
  documents: DocumentFile[];
};

export type VehicleFilters = {
  page: number;
  pageSize: number;
  q: string;
  type: string;
  status: VehicleStatus | "";
};
