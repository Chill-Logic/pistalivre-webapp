import type { CustomerFilters } from "@/types/customer";
import type { RentalFilters } from "@/types/rental";
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
  rentals: {
    all: ["rentals"] as const,
    list: (filters: RentalFilters) =>
      [...queryKeys.rentals.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.rentals.all, "detail", id] as const,
    charges: (id: string) => [...queryKeys.rentals.all, "charges", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filters: CustomerFilters) =>
      [...queryKeys.customers.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.customers.all, "detail", id] as const,
  },
  labels: {
    all: ["labels"] as const,
  },
};
