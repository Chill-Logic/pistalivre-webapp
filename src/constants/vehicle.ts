import type { VehicleStatus } from "@/types/vehicle";

/**
 * Legal status transitions (same rule as the API's vehicle.entity; an illegal
 * one answers 422). Only these become buttons.
 */
export const VEHICLE_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  AVAILABLE: ["RENTED", "MAINTENANCE", "INACTIVE"],
  RENTED: ["AVAILABLE", "MAINTENANCE"],
  MAINTENANCE: ["AVAILABLE", "INACTIVE"],
  INACTIVE: ["AVAILABLE"],
};
