import type { VehicleType } from "@/types/vehicle";

/** A vehicle category (one type each), as Frota › Categorias lists it. */
export type VehicleCategory = {
  id: string;
  name: string;
  slug: string;
  type: VehicleType;
  vehicleCount: number;
};

export type VehicleCategoryInput = {
  vehicleTypeId: string;
  name: string;
};
