import type { VehicleFilters } from "@/types/vehicle";

/** Query key factory: one place to build and invalidate cache keys. */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  vehicles: {
    all: ["vehicles"] as const,
    list: (filters: VehicleFilters) =>
      [...queryKeys.vehicles.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.vehicles.all, "detail", id] as const,
  },
  vehicleTypes: {
    all: ["vehicle-types"] as const,
  },
};
