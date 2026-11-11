import type { VehicleStatus } from "@/types/vehicle";

/**
 * Legal status transitions (same rule as the API's vehicle.entity; an illegal
 * one answers 422). Only these become buttons.
 */
export const VEHICLE_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  AVAILABLE: ["RENTED", "MAINTENANCE", "INACTIVE"],
  // Set by the rental flow; by hand only out to maintenance or back to free.
  IN_CONTRACTING: ["AVAILABLE", "MAINTENANCE"],
  RESERVED: ["AVAILABLE", "MAINTENANCE"],
  RENTED: ["AVAILABLE", "MAINTENANCE"],
  MAINTENANCE: ["AVAILABLE", "INACTIVE"],
  INACTIVE: ["AVAILABLE"],
};
