export type VehicleStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";

type Ref = { id: string; name: string };
type SluggedRef = Ref & { slug: string };

export type Vehicle = {
  id: string;
  plate: string;
  type: SluggedRef;
  brand: Ref;
  model: Ref;
  year: number;
  category: SluggedRef;
  color: string | null;
  chassis: string;
  renavam: string;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
};

export type VehicleFilters = {
  page: number;
  pageSize: number;
  q: string;
  type: string;
  status: VehicleStatus | "";
};
