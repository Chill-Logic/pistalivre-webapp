import type { VehicleStatus } from "@/types/vehicle";

/** Portuguese labels for the English domain codes returned by the API. */
export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: "Disponível",
  RENTED: "Alugado",
  MAINTENANCE: "Manutenção",
  INACTIVE: "Inativo",
};

// TODO: replace with GET /api/v1/vehicle-types once published.
export const VEHICLE_TYPE_OPTIONS = [
  { value: "moto", label: "Moto" },
  { value: "carro", label: "Carro" },
  { value: "van", label: "Van" },
];
