import type { VehicleStatus } from "@/types/vehicle";

/** Portuguese labels for the English domain codes returned by the API. */
export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: "Disponível",
  RENTED: "Alugado",
  MAINTENANCE: "Manutenção",
  INACTIVE: "Inativo",
};
