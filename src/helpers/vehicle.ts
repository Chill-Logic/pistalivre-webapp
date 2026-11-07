import type { Vehicle, VehicleStatus } from "@/types/vehicle";

/**
 * The active rental is the source of truth for "rented": old rows may still
 * say AVAILABLE while a rental is running.
 */
export function effectiveVehicleStatus(vehicle: Vehicle): VehicleStatus {
  return vehicle.activeRental ? "RENTED" : vehicle.status;
}

/** "Fiat Toro Volcano" */
export function vehicleName(vehicle: {
  brand: { name: string };
  model: { name: string };
}) {
  return `${vehicle.brand.name} ${vehicle.model.name}`;
}
